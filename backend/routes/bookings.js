const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { BookingCreateSchema, BookingUpdateSchema } = require('../validators/schemas');
const { sendRoomBookingConfirmationEmail, sendHallBookingConfirmationEmail } = require('../services/emailService');

module.exports = ({ pgClient, readJSON, writeJSON, bookingsPath, logger }) => {
  // Helper to normalize booking data from DB (snake_case) to standard camelCase format
  const normalizeDbBooking = (booking) => {
    if (!booking) return booking;
    
    // Parse booking_data JSON if it's a string
    let bookingData = booking.booking_data;
    if (typeof bookingData === 'string') {
      try {
        bookingData = JSON.parse(bookingData);
      } catch (e) {
        bookingData = {};
      }
    }
    if (!bookingData) bookingData = {};

    return {
      id: booking.id,
      guestName: booking.customer_name || booking.customerName || '',
      email: booking.customer_email || booking.customerEmail || '',
      phone: booking.customer_phone || booking.customerPhone || '',
      roomName: bookingData.roomName || bookingData.room_name || '',
      roomId: bookingData.roomId || bookingData.room_id || '',
      checkIn: bookingData.checkIn || bookingData.check_in || '',
      checkOut: bookingData.checkOut || bookingData.check_out || '',
      nights: bookingData.nights || 0,
      guests: bookingData.guests || 0,
      totalPrice: booking.total || booking.totalPrice || 0,
      status: booking.status || 'booked',
      paymentStatus: booking.payment_status || booking.paymentStatus || 'pending',
      bookingType: booking.booking_type || booking.bookingType || 'room',
      createdAt: booking.created_at || booking.createdAt || '',
      updatedAt: booking.updated_at || booking.updatedAt || ''
    };
  };

  // GET - list bookings (protected)
  router.get('/', authenticate, async (req, res) => {
    try {
      if (pgClient) {
        const { rows } = await pgClient.query('SELECT * FROM bookings ORDER BY created_at DESC');
        // normalize all bookings
        const normalized = rows.map(b => normalizeDbBooking(b));
        return res.json(normalized);
      }
      const bookings = readJSON(bookingsPath, []);
      return res.json(bookings);
    } catch (e) {
      logger.error('GET /api/bookings error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // POST - create booking (public)
  router.post('/', async (req, res) => {
    try {
      // normalize legacy flat booking properties (roomId, checkInDate, price, etc.)
      const incoming = { ...req.body };
      // ensure bookingData object exists
      if (!incoming.bookingData) {
        incoming.bookingData = {};
        // migrate known fields into bookingData
        if (incoming.roomId !== undefined) { incoming.bookingData.roomId = incoming.roomId; delete incoming.roomId; }
        if (incoming.hallId !== undefined) { incoming.bookingData.hallId = incoming.hallId; delete incoming.hallId; }
        if (incoming.checkInDate !== undefined) { incoming.bookingData.checkIn = incoming.checkInDate; delete incoming.checkInDate; }
        if (incoming.checkOutDate !== undefined) { incoming.bookingData.checkOut = incoming.checkOutDate; delete incoming.checkOutDate; }
        if (incoming.checkIn !== undefined) { incoming.bookingData.checkIn = incoming.checkIn; delete incoming.checkIn; }
        if (incoming.checkOut !== undefined) { incoming.bookingData.checkOut = incoming.checkOut; delete incoming.checkOut; }
        if (incoming.guests !== undefined) { incoming.bookingData.guests = incoming.guests; delete incoming.guests; }
        if (incoming.guestCount !== undefined) { incoming.bookingData.guests = incoming.guestCount; delete incoming.guestCount; }
        if (incoming.eventDate !== undefined) { incoming.bookingData.eventDate = incoming.eventDate; delete incoming.eventDate; }
        if (incoming.eventTime !== undefined) { incoming.bookingData.eventTime = incoming.eventTime; delete incoming.eventTime; }
        if (incoming.specialRequests !== undefined) { incoming.bookingData.specialRequests = incoming.specialRequests; delete incoming.specialRequests; }
      }
      // ensure total field present
      if (incoming.total === undefined && incoming.price !== undefined) {
        incoming.total = incoming.price;
        delete incoming.price;
      }

      const parsed = BookingCreateSchema.safeParse(incoming);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }

      const payload = parsed.data;
      const id = `BOOK-${Date.now()}`;

      if (pgClient) {
        const q = `INSERT INTO bookings (id, customer_name, customer_email, customer_phone, booking_type, booking_data, total, payment_status, payment_data, status)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
        const values = [id, payload.customerName, payload.customerEmail||null, payload.customerPhone||null, payload.bookingType, JSON.stringify(payload.bookingData||{}), payload.total, payload.paymentStatus, JSON.stringify(payload.paymentData||null), payload.status];
        const { rows } = await pgClient.query(q, values);
        
        // Send confirmation email
        try {
          if (payload.bookingType === 'room') {
            await sendRoomBookingConfirmationEmail(payload.customerEmail, { ...rows[0], id });
          } else {
            await sendHallBookingConfirmationEmail(payload.customerEmail, { ...rows[0], id });
          }
        } catch (emailErr) {
          logger.warn(`Booking confirmation email failed: ${emailErr.message}`);
        }

        // Normalize and return the created booking
        return res.status(201).json(normalizeDbBooking(rows[0]));
      }

      const bookings = readJSON(bookingsPath, []);
      const created = { id, ...payload, createdAt: new Date().toISOString() };
      bookings.unshift(created);
      writeJSON(bookingsPath, bookings);

      // Send confirmation email to customer if email provided
      if (created.customerEmail) {
        try {
          if (payload.bookingType === 'room') {
            await sendRoomBookingConfirmationEmail(created.customerEmail, created);
          } else {
            await sendHallBookingConfirmationEmail(created.customerEmail, created);
          }
        } catch (emailErr) {
          logger.warn(`Booking confirmation email failed: ${emailErr.message}`);
        }
      }

      return res.status(201).json(created);
    } catch (e) {
      logger.error('POST /api/bookings error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // PUT - update booking (protected)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      const parsed = BookingUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }

      const payload = parsed.data;
      if (pgClient) {
        const updates = [];
        const values = [];
        let idx = 1;
        
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined) {
            if (k === 'status') {
              updates.push(`status = $${idx++}`);
              values.push(v);
            } else if (k === 'paymentStatus') {
              updates.push(`payment_status = $${idx++}`);
              values.push(v);
            } else if (k === 'bookingData') {
              updates.push(`booking_data = $${idx++}`);
              values.push(JSON.stringify(v));
            }
          }
        }
        
        if (updates.length === 0) return res.status(400).json({ error: 'no_updates' });
        const q = `UPDATE bookings SET ${updates.join(',')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
        values.push(id);
        const { rows } = await pgClient.query(q, values);
        if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
        // Normalize and return the updated booking
        return res.json(normalizeDbBooking(rows[0]));
      }

      const bookings = readJSON(bookingsPath, []);
      const idx = bookings.findIndex(b => b.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      bookings[idx] = { ...bookings[idx], ...payload, updatedAt: new Date().toISOString() };
      writeJSON(bookingsPath, bookings);
      return res.json(bookings[idx]);
    } catch (e) {
      logger.error('PUT /api/bookings/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
