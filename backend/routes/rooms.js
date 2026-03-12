const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { uploadAndOptimizeMultipleImages } = require('../middleware/fileUpload');
const { RoomCreateSchema, RoomUpdateSchema } = require('../validators/schemas');

module.exports = ({ pgClient, readJSON, writeJSON, roomsPath, logger }) => {
  logger.info('[roomsRouter] Exported function called');

  const parseJsonArray = (value) => {
    if (Array.isArray(value)) {
      // Handle legacy data where arrays were stored as JSON.stringify'd strings inside text[]
      if (value.length === 1 && typeof value[0] === 'string' && value[0].startsWith('[')) {
        try {
          const inner = JSON.parse(value[0]);
          if (Array.isArray(inner)) return inner;
        } catch { /* not JSON, treat as normal string element */ }
      }
      return value;
    }
    if (typeof value !== 'string') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Helper to normalize room data from DB (snake_case) to standard camelCase format
  const normalizeDbRoom = (room) => {
    if (!room) return room;
    return {
      id: room.id,
      roomNumber: room.room_number || room.roomNumber || '',
      name: room.name,
      type: room.type,
      description: room.description || '',
      pricePerNight: room.price_per_night !== undefined ? room.price_per_night : (room.pricePerNight || 0),
      capacity: room.capacity || 2,
      amenities: parseJsonArray(room.amenities),
      availability: room.availability !== undefined ? room.availability : true,
      images: parseJsonArray(room.images),
      createdAt: room.created_at || room.createdAt || '',
      updatedAt: room.updated_at || room.updatedAt || ''
    };
  };
  
  // Test endpoint to verify router is mounted
  router.get('/test', (req, res) => {
    logger.info('GET /api/rooms/test - Router is mounted and working!');
    return res.json({ status: 'ok', message: 'Rooms router is mounted successfully' });
  });

  // GET - List all rooms (public)
  router.get('/', async (req, res) => {
    try {
      logger.info('[Rooms GET /] Endpoint handler called on server');
      logger.info('GET /api/rooms - pgClient available:', !!pgClient);
      if (pgClient) {
        try {
          const { rows } = await pgClient.query('SELECT * FROM rooms ORDER BY created_at DESC');
          logger.info('GET /api/rooms - DB query successful, rows:', rows.length);
          // DB is the single source of truth — never merge/override with local JSON
          // (JSON file is ephemeral on Render and resets on every restart)
          const normalized = rows.map(r => normalizeDbRoom(r));
          return res.json(normalized);
        } catch (dbErr) {
          logger.warn('GET /api/rooms - DB query failed, falling back to JSON:', dbErr.message);
        }
      }
      const rooms = readJSON(roomsPath, []);
      logger.info('GET /api/rooms - Returning', rooms.length, 'rooms from JSON file');
      // ensure all rooms have availability set to true
      const roomsWithAvailability = rooms.map(r => ({
        ...r,
        availability: r.availability !== undefined ? r.availability : true
      }));
      return res.json(roomsWithAvailability);
    } catch (e) {
      logger.error('GET /api/rooms error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // POST - Create room (protected)
  router.post('/', authenticate, async (req, res) => {
    try {
      // Accept JSON body - images are base64 data URLs stored directly in DB (no ephemeral disk)
      const body = { ...req.body };
      
      if (body.price !== undefined && body.pricePerNight === undefined) {
        body.pricePerNight = parseFloat(body.price);
        delete body.price;
      }
      
      logger.info('POST /api/rooms body after conversion:', body);
      const payload = RoomCreateSchema.parse(body);
      logger.info('POST /api/rooms payload after schema validation:', payload);
      
      const id = `room-${Date.now()}`;
      
      if (pgClient) {
        // determine which columns actually exist in the rooms table
        const { rows: colRows } = await pgClient.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name='rooms'`
        );
        const existingCols = colRows.map(r => r.column_name);

        // dynamic mapping from payload keys to whichever column is available
        const keyMap = {};
        if (existingCols.includes('room_number')) keyMap.roomNumber = 'room_number';
        // price: prefer new column but fall back to old `price`
        if (existingCols.includes('price_per_night')) {
          keyMap.pricePerNight = 'price_per_night';
        } else if (existingCols.includes('price')) {
          keyMap.pricePerNight = 'price';
        }
        // type column may or may not exist, but if it does we just use same name
        if (existingCols.includes('type')) keyMap.type = 'type';

        const dbCols = ['id'];
        const values = [id];
        const arrayColumns = new Set(['images', 'amenities']);

        for (const [k, v] of Object.entries(payload)) {
          if (v === undefined) continue;
          const col = keyMap[k] || k;
          if (!existingCols.includes(col)) continue;
          dbCols.push(col);
          values.push(v);
        }

        // Build placeholders with explicit type casting for array columns
        const placeholders = dbCols.map((col, i) => {
          return arrayColumns.has(col) ? `$${i + 1}::text[]` : `$${i + 1}`;
        });
        const q = `INSERT INTO rooms (${dbCols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
        const { rows } = await pgClient.query(q, values);
        if (!rows || rows.length === 0) {
          throw new Error('INSERT returned no rows');
        }
        const room = rows[0];
        logger.info('POST /api/rooms - DB columns detected:', existingCols);
        // normalize DB response to camelCase format
        const normalized = normalizeDbRoom(room);
        // also write payload to JSON fallback so we can merge on future GETs
        try {
          const roomsFile = readJSON(roomsPath, []);
          const createdPayload = { id, ...payload, createdAt: new Date().toISOString(), availability: payload.availability !== undefined ? payload.availability : true };
          roomsFile.unshift(createdPayload);
          writeJSON(roomsPath, roomsFile);
        } catch (e) {
          logger.warn('POST /api/rooms - failed to update JSON fallback', e.message);
        }
        // return merged object so client sees what was submitted even if DB dropped some fields
        return res.status(201).json({ ...normalized, ...payload });
      }
      const rooms = readJSON(roomsPath, []);
      const created = { id, ...payload, createdAt: new Date().toISOString(), availability: payload.availability !== undefined ? payload.availability : true };
      rooms.unshift(created);
      writeJSON(roomsPath, rooms);
      return res.status(201).json(created);
    } catch (e) {
      if (e.name === 'ZodError') {
        logger.error('POST /api/rooms validation error:', e.errors);
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('POST /api/rooms error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // PUT - Update room (protected)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      // Accept JSON body - images are base64 data URLs stored directly in DB (no ephemeral disk)
      const body = { ...req.body };

      if (body.price !== undefined && body.pricePerNight === undefined) {
        body.pricePerNight = parseFloat(body.price);
        delete body.price;
      }
      
      const payload = RoomUpdateSchema.parse(body);
      
      let useDB = false;
      if (pgClient) {
        try {
          // check if table exists at all
          const { rows: check } = await pgClient.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='rooms' LIMIT 1`
          );
          useDB = check && check.length > 0;
          if (useDB) {
            // get current column list so we only update what exists
            const { rows: colRows } = await pgClient.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='rooms'`
            );
            const existingCols = colRows.map(r => r.column_name);

            const keyMap = {};
            if (existingCols.includes('room_number')) keyMap.roomNumber = 'room_number';
            if (existingCols.includes('price_per_night')) {
              keyMap.pricePerNight = 'price_per_night';
            } else if (existingCols.includes('price')) {
              keyMap.pricePerNight = 'price';
            }
            if (existingCols.includes('type')) keyMap.type = 'type';

            const updates = [];
            const values = [];
            let idx = 1;
            const arrayColumns = new Set(['images', 'amenities']);
            for (const [k, v] of Object.entries(payload)) {
              if (v === undefined) continue;
              const col = keyMap[k] || k;
              if (!existingCols.includes(col)) continue;
              // Add explicit type casting for array columns
              const cast = arrayColumns.has(col) ? `::text[]` : '';
              updates.push(`${col} = $${idx}${cast}`);
              values.push(v);
              idx++;
            }
            if (updates.length === 0) return res.status(400).json({ error: 'no_updates' });
            const q = `UPDATE rooms SET ${updates.join(',')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
            values.push(id);
            const { rows } = await pgClient.query(q, values);
            if (rows.length === 0) {
              // not in DB, fall back to JSON below
              useDB = false;
            } else {
              // normalize DB response to camelCase format
              const room = normalizeDbRoom(rows[0]);
              // update JSON fallback copy so UI will see the same values even if DB drops columns
              try {
                const roomsFile = readJSON(roomsPath, []);
                const existingIndex = roomsFile.findIndex(r => r.id === id);
                const updatedPayload = { id, ...payload, updatedAt: new Date().toISOString() };
                if (existingIndex >= 0) {
                  roomsFile[existingIndex] = { ...roomsFile[existingIndex], ...updatedPayload };
                } else {
                  roomsFile.unshift(updatedPayload);
                }
                writeJSON(roomsPath, roomsFile);
              } catch (e) {
                logger.warn('PUT /api/rooms - failed to update JSON fallback', e.message);
              }
              return res.json({ ...room, ...payload });
            }
          }
        } catch (dbErr) {
          logger.warn('PUT /api/rooms/:id DB error', dbErr.message);
          useDB = false;
        }
      }
      const rooms = readJSON(roomsPath, []);
      const idx = rooms.findIndex(it => it.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      const updated = { ...rooms[idx], ...payload, updatedAt: new Date().toISOString(), availability: payload.availability !== undefined ? payload.availability : (rooms[idx].availability !== undefined ? rooms[idx].availability : true) };
      rooms[idx] = updated;
      writeJSON(roomsPath, rooms);
      return res.json(updated);
    } catch (e) {
      if (e.name === 'ZodError') {
        logger.error('PUT /api/rooms/:id validation error:', e.errors);
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('PUT /api/rooms/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // DELETE - Delete room (protected)
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      if (pgClient) {
        try {
          const result = await pgClient.query('DELETE FROM rooms WHERE id = $1', [id]);
          if (result.rowCount === 0) {
            // not in DB, attempt JSON fallback remove
            const rooms = readJSON(roomsPath, []);
            const idx = rooms.findIndex(it => it.id === id);
            if (idx === -1) return res.status(404).json({ error: 'not_found' });
            rooms.splice(idx, 1);
            writeJSON(roomsPath, rooms);
            return res.status(204).send();
          }
          return res.status(204).send();
        } catch (dbErr) {
          logger.warn('DELETE /api/rooms/:id DB error, falling back to JSON', dbErr.message);
          const rooms = readJSON(roomsPath, []);
          const idx = rooms.findIndex(it => it.id === id);
          if (idx === -1) return res.status(404).json({ error: 'not_found' });
          rooms.splice(idx, 1);
          writeJSON(roomsPath, rooms);
          return res.status(204).send();
        }
      }
      const rooms = readJSON(roomsPath, []);
      const idx = rooms.findIndex(it => it.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      rooms.splice(idx, 1);
      writeJSON(roomsPath, rooms);
      return res.status(204).send();
    } catch (e) {
      logger.error('DELETE /api/rooms/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
