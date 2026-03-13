const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { BookingCreateSchema, BookingUpdateSchema } = require('../validators/schemas');
const { sendRoomBookingConfirmationEmail, sendHallBookingConfirmationEmail } = require('../services/emailService');

module.exports = ({ pgClient, readJSON, writeJSON, bookingsPath, logger }) => {
  const getBookingsColumns = async () => {
    if (!pgClient) return new Set();
    try {
      const { rows } = await pgClient.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'bookings'
      `);
      return new Set(rows.map(row => row.column_name));
    } catch (error) {
      logger.warn(`Unable to inspect bookings columns: ${error.message}`);
      return new Set();
    }
  };

  const dropBookingCheckConstraints = async () => {
    if (!pgClient) return;
    try {
      const { rows } = await pgClient.query(`
        SELECT con.conname
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'bookings'
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
      `);
      for (const row of rows) {
        await pgClient.query(`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS ${row.conname}`).catch(() => {});
      }
    } catch (error) {
      logger.warn(`Unable to refresh bookings constraints: ${error.message}`);
    }
  };

  const ensureBookingsTable = async () => {
    if (!pgClient) return;

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id text PRIMARY KEY,
        customer_name text,
        customer_email text,
        customer_phone text,
        booking_type text DEFAULT 'room',
        booking_data jsonb DEFAULT '{}'::jsonb,
        total numeric DEFAULT 0,
        status text DEFAULT 'pending',
        payment_status text DEFAULT 'pending',
        payment_data jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);

    const existingColumns = await getBookingsColumns();
    const alterColumns = [
      ['customer_name', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name text`],
      ['customer_email', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email text`],
      ['customer_phone', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone text`],
      ['guest_name', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name text`],
      ['booking_type', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type text DEFAULT 'room'`],
      ['booking_data', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_data jsonb DEFAULT '{}'::jsonb`],
      ['room_name', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_name text`],
      ['room_id', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id text`],
      ['hall_id', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hall_id text`],
      ['check_in', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in timestamptz`],
      ['check_out', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out timestamptz`],
      ['nights', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS nights integer DEFAULT 1`],
      ['guests', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guests integer DEFAULT 1`],
      ['guest_count', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_count integer DEFAULT 1`],
      ['total', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0`],
      ['status', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'`],
      ['payment_status', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'`],
      ['payment_data', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_data jsonb`],
      ['created_at', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()`],
      ['updated_at', `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`]
    ];

    for (const [columnName, sql] of alterColumns) {
      if (!existingColumns.has(columnName)) {
        await pgClient.query(sql).catch(error => {
          logger.warn(`Unable to add bookings.${columnName}: ${error.message}`);
        });
      }
    }

    const refreshedColumns = await getBookingsColumns();

    if (refreshedColumns.has('booking_type')) {
      await pgClient.query(`
      UPDATE bookings
      SET booking_type = COALESCE(booking_type, type, 'room')
      WHERE booking_type IS NULL
      `).catch(() => {});
    }
    if (refreshedColumns.has('booking_data')) {
      await pgClient.query(`
      UPDATE bookings
      SET booking_data = COALESCE(booking_data, payload, '{}'::jsonb)
      WHERE booking_data IS NULL
      `).catch(() => {});
    }
    if (refreshedColumns.has('total')) {
      await pgClient.query(`
      UPDATE bookings
      SET total = COALESCE(total, total_price, 0)
      WHERE total IS NULL
      `).catch(() => {});
    }
    if (refreshedColumns.has('customer_name')) {
      await pgClient.query(`
      UPDATE bookings
      SET customer_name = COALESCE(customer_name, payload->>'customerName', payload->>'guestName', 'Guest User')
      WHERE customer_name IS NULL
      `).catch(() => {});
    }
    if (refreshedColumns.has('customer_email')) {
      await pgClient.query(`
      UPDATE bookings
      SET customer_email = COALESCE(customer_email, payload->>'customerEmail')
      WHERE customer_email IS NULL
      `).catch(() => {});
    }
    if (refreshedColumns.has('customer_phone')) {
      await pgClient.query(`
      UPDATE bookings
      SET customer_phone = COALESCE(customer_phone, payload->>'customerPhone')
      WHERE customer_phone IS NULL
      `).catch(() => {});
    }

    await dropBookingCheckConstraints();

    if (refreshedColumns.has('status')) {
      await pgClient.query(`ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'booked', 'confirmed', 'cancelled', 'completed'))`).catch(() => {});
    }
    if (refreshedColumns.has('payment_status')) {
      await pgClient.query(`ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))`).catch(() => {});
    }
    if (refreshedColumns.has('booking_type')) {
      await pgClient.query(`ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check CHECK (booking_type IN ('room', 'hall'))`).catch(() => {});
    }
  };

  const insertBookingRow = async (id, payload) => {
    const columns = await getBookingsColumns();

    const bookingData = payload.bookingData || {};
    const roomId = bookingData.roomId || bookingData.room_id || null;
    const roomName = bookingData.roomName || bookingData.room_name || null;
    const hallId = bookingData.hallId || bookingData.hall_id || null;
    const checkInRaw = bookingData.checkIn || bookingData.check_in || null;
    const checkOutRaw = bookingData.checkOut || bookingData.check_out || null;
    const nights = Math.max(1, Number(bookingData.nights || 1));
    const guests = Math.max(1, Number(bookingData.guests || bookingData.guestCount || 1));

    if (payload.bookingType === 'room' && columns.has('room_id') && !roomId) {
      throw new Error('Room ID is required for room booking');
    }

    const insertColumns = [];
    const values = [];
    const addValue = (column, value) => {
      if (columns.has(column)) {
        insertColumns.push(column);
        values.push(value);
      }
    };

    addValue('id', id);
    addValue('customer_name', payload.customerName);
    addValue('guest_name', payload.customerName);
    addValue('customer_email', payload.customerEmail || null);
    addValue('customer_phone', payload.customerPhone || null);
    addValue('booking_type', payload.bookingType);
    addValue('type', payload.bookingType);
    addValue('booking_data', JSON.stringify(bookingData));
    addValue('payload', JSON.stringify({
      customerName: payload.customerName,
      customerEmail: payload.customerEmail || null,
      customerPhone: payload.customerPhone || null,
      ...bookingData
    }));
    addValue('room_name', roomName);
    addValue('room_id', roomId);
    addValue('hall_id', hallId);
    addValue('check_in', checkInRaw ? new Date(checkInRaw) : null);
    addValue('check_out', checkOutRaw ? new Date(checkOutRaw) : null);
    addValue('nights', nights);
    addValue('guests', guests);
    addValue('guest_count', guests);
    addValue('total', payload.total);
    addValue('total_price', payload.total);
    addValue('payment_status', payload.paymentStatus);
    addValue('payment_data', JSON.stringify(payload.paymentData ?? null));
    addValue('status', payload.status === 'pending' && columns.has('type') ? 'booked' : payload.status);

    if (!insertColumns.includes('id')) {
      throw new Error('Bookings table is missing id column for insert');
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(',');
    const q = `INSERT INTO bookings (${insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await pgClient.query(q, values);
    return rows[0];
  };

  // Helper to normalize booking data from DB (snake_case) to standard camelCase format
  const normalizeDbBooking = (booking) => {
    if (!booking) return booking;
    
    // Parse booking_data JSON if it's a string
    let bookingData = booking.booking_data ?? booking.payload;
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
      guestName: booking.customer_name || booking.customerName || bookingData.customerName || bookingData.guestName || '',
      email: booking.customer_email || booking.customerEmail || bookingData.customerEmail || '',
      phone: booking.customer_phone || booking.customerPhone || bookingData.customerPhone || '',
      roomName: bookingData.roomName || bookingData.room_name || booking.room_name || '',
      roomId: bookingData.roomId || bookingData.room_id || booking.room_id || '',
      checkIn: bookingData.checkIn || bookingData.check_in || booking.check_in || '',
      checkOut: bookingData.checkOut || bookingData.check_out || booking.check_out || '',
      nights: bookingData.nights || 0,
      guests: bookingData.guests || 0,
      totalPrice: booking.total || booking.totalPrice || booking.total_price || 0,
      status: booking.status || 'pending',
      paymentStatus: booking.payment_status || booking.paymentStatus || 'pending',
      bookingType: booking.booking_type || booking.bookingType || booking.type || 'room',
      createdAt: booking.created_at || booking.createdAt || '',
      updatedAt: booking.updated_at || booking.updatedAt || ''
    };
  };

  // GET - list bookings (protected)
  // GET /mine - user's own bookings by email (requires auth)
  router.get('/mine', authenticate, async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'unauthorized' });
    try {
      if (pgClient) {
        await ensureBookingsTable();
        const { rows } = await pgClient.query(
          'SELECT * FROM bookings WHERE customer_email = $1 ORDER BY created_at DESC',
          [email]
        );
        return res.json(rows.map(b => normalizeDbBooking(b)));
      }
      const bookings = readJSON(bookingsPath, []);
      return res.json(bookings.filter(b => (b.customerEmail || b.customer_email) === email));
    } catch (e) {
      logger.error('GET /api/bookings/mine error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // GET - list all bookings (admin/protected)
  router.get('/', authenticate, async (req, res) => {
    try {
      if (pgClient) {
        await ensureBookingsTable();
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
      if (pgClient) {
        await ensureBookingsTable();
      }
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
        const createdRow = await insertBookingRow(id, payload);
        
        // Send confirmation email
        try {
          if (payload.bookingType === 'room') {
            await sendRoomBookingConfirmationEmail(payload.customerEmail, { ...createdRow, id });
          } else {
            await sendHallBookingConfirmationEmail(payload.customerEmail, { ...createdRow, id });
          }
        } catch (emailErr) {
          logger.warn(`Booking confirmation email failed: ${emailErr.message}`);
        }

        // Normalize and return the created booking
        return res.status(201).json(normalizeDbBooking(createdRow));
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
      logger.error('POST /api/bookings error', e.message, e.stack);
      res.status(500).json({
        error: e.message || 'server_error',
        details: [{ message: e.message || 'Unknown booking error' }]
      });
    }
  });

  // PUT - update booking (protected)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      if (pgClient) {
        await ensureBookingsTable();
      }
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
