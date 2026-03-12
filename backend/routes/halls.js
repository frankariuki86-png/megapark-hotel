const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { uploadAndOptimizeMultipleImages } = require('../middleware/fileUpload');
const { HallCreateSchema, HallUpdateSchema } = require('../validators/schemas');

module.exports = ({ pgClient, readJSON, writeJSON, hallsPath, logger }) => {
  logger.info('[hallsRouter] Exported function called');

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

  const normalizeDbHall = (hall) => {
    if (!hall) return hall;
    return {
      id: hall.id,
      name: hall.name,
      description: hall.description || '',
      capacity: hall.capacity !== undefined ? Number(hall.capacity) : 100,
      pricePerDay: hall.price_per_day !== undefined
        ? Number(hall.price_per_day)
        : (hall.pricePerDay !== undefined ? Number(hall.pricePerDay) : (hall.price !== undefined ? Number(hall.price) : 0)),
      images: parseJsonArray(hall.images),
      amenities: parseJsonArray(hall.amenities),
      availability: hall.availability !== undefined ? hall.availability : true,
      createdAt: hall.created_at || hall.createdAt || '',
      updatedAt: hall.updated_at || hall.updatedAt || ''
    };
  };
  
  // Test endpoint to verify router is mounted
  router.get('/test', (req, res) => {
    logger.info('GET /api/halls/test - Router is mounted and working!');
    return res.json({ status: 'ok', message: 'Halls router is mounted successfully' });
  });

  // GET - List all halls (public)
  router.get('/', async (req, res) => {
    try {
      logger.info('[Halls GET /] Endpoint handler called on server');
      logger.info('GET /api/halls - pgClient available:', !!pgClient);
      if (pgClient) {
        try {
          const { rows } = await pgClient.query('SELECT * FROM halls ORDER BY created_at DESC');
          logger.info('GET /api/halls - DB query successful, rows:', rows.length);
          // DB is the single source of truth — never merge/override with local JSON
          // (JSON file is ephemeral on Render and resets on every restart)
          const normalized = rows.map(r => normalizeDbHall(r));
          return res.json(normalized);
        } catch (dbErr) {
          logger.warn('GET /api/halls - DB query failed, falling back to JSON:', dbErr.message);
        }
      }
      const halls = readJSON(hallsPath, []);
      logger.info('GET /api/halls - Returning', halls.length, 'halls from JSON file');
      return res.json(halls);
    } catch (e) {
      logger.error('GET /api/halls error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // POST - Create hall (protected)
  router.post('/', authenticate, async (req, res) => {
    try {
      // Accept JSON body - images are base64 data URLs stored directly in DB (no ephemeral disk)
      const body = { ...req.body };
      if (body.price !== undefined && body.pricePerDay === undefined) {
        body.pricePerDay = parseFloat(body.price);
        delete body.price;
      }

      const payload = HallCreateSchema.parse(body);
      const id = `hall-${Date.now()}`;
      
      let useDB = false;
      if (pgClient) {
        try {
          // Check if halls table exists and has columns
          const { rows: colRows } = await pgClient.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='halls' LIMIT 1`
          );
          useDB = colRows && colRows.length > 0;
          if (useDB) {
            // Fetch all columns for building dynamic INSERT
            const { rows: allCols } = await pgClient.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='halls'`
            );
            const existingCols = allCols.map(r => r.column_name);
            const keyMap = {};
            if (existingCols.includes('price_per_day')) {
              keyMap.pricePerDay = 'price_per_day';
            } else if (existingCols.includes('price')) {
              keyMap.pricePerDay = 'price';
            }

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
            const q = `INSERT INTO halls (${dbCols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
            const { rows } = await pgClient.query(q, values);
            if (!rows || rows.length === 0) {
              throw new Error('INSERT returned no rows');
            }
            const normalized = normalizeDbHall(rows[0]);
            try {
              const hallsFile = readJSON(hallsPath, []);
              const createdPayload = { id, ...payload, createdAt: new Date().toISOString(), availability: payload.availability !== undefined ? payload.availability : true };
              hallsFile.unshift(createdPayload);
              writeJSON(hallsPath, hallsFile);
            } catch (e) {
              logger.warn('POST /api/halls - failed to update JSON fallback', e.message);
            }
            return res.status(201).json({ ...normalized, ...payload });
            }
          }
        } catch (dbErr) {
          logger.warn('POST /api/halls DB error:', dbErr.message);
          useDB = false; // Fall back to JSON
        }
      }
      
      // JSON fallback
      const halls = readJSON(hallsPath, []);
      const created = { id, ...payload, createdAt: new Date().toISOString() };
      halls.unshift(created);
      writeJSON(hallsPath, halls);
      return res.status(201).json(created);
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('POST /api/halls error', e.message, e.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // PUT - Update hall (protected)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      // Accept JSON body - images are base64 data URLs stored directly in DB (no ephemeral disk)
      const body = { ...req.body };
      if (body.price !== undefined && body.pricePerDay === undefined) {
        body.pricePerDay = parseFloat(body.price);
        delete body.price;
      }

      const payload = HallUpdateSchema.parse(body);
      
      let useDB = false;
      if (pgClient) {
        try {
          // Check if halls table exists
          const { rows: checkRows } = await pgClient.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name='halls' LIMIT 1`
          );
          useDB = checkRows && checkRows.length > 0;
          
          if (useDB) {
            // Fetch all columns
            const { rows: allCols } = await pgClient.query(
              `SELECT column_name FROM information_schema.columns WHERE table_name='halls'`
            );
            const existingCols = allCols.map(r => r.column_name);
            const keyMap = {};
            if (existingCols.includes('price_per_day')) {
              keyMap.pricePerDay = 'price_per_day';
            } else if (existingCols.includes('price')) {
              keyMap.pricePerDay = 'price';
            }

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

            if (updates.length > 0) {
              const q = `UPDATE halls SET ${updates.join(',')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
              values.push(id);
              const { rows } = await pgClient.query(q, values);
              if (rows && rows[0]) {
                const hall = normalizeDbHall(rows[0]);
                try {
                  const hallsFile = readJSON(hallsPath, []);
                  const existingIndex = hallsFile.findIndex(h => h.id === id);
                  const updatedPayload = { id, ...payload, updatedAt: new Date().toISOString() };
                  if (existingIndex >= 0) {
                    hallsFile[existingIndex] = { ...hallsFile[existingIndex], ...updatedPayload };
                  } else {
                    hallsFile.unshift(updatedPayload);
                  }
                  writeJSON(hallsPath, hallsFile);
                } catch (e) {
                  logger.warn('PUT /api/halls - failed to update JSON fallback', e.message);
                }
                return res.json({ ...hall, ...payload });
              } else if (rows && rows.length === 0) {
                // Hall not found in DB, fall back to JSON
                useDB = false;
              }
            } else {
              return res.status(400).json({ error: 'no_updates' });
            }
          }
        } catch (dbErr) {
          logger.warn('PUT /api/halls DB error:', dbErr.message);
          useDB = false;
        }
      }
      
      // JSON fallback
      const halls = readJSON(hallsPath, []);
      const idx = halls.findIndex(it => it.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      halls[idx] = { ...halls[idx], ...payload, updatedAt: new Date().toISOString() };
      writeJSON(hallsPath, halls);
      return res.json(halls[idx]);
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('PUT /api/halls/:id error', e.message, e.stack);
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // DELETE - Delete hall (protected)
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const id = req.params.id;
      if (pgClient) {
        try {
          const result = await pgClient.query('DELETE FROM halls WHERE id = $1', [id]);
          if (result.rowCount === 0) {
            // not found in db, try JSON
            const halls = readJSON(hallsPath, []);
            const idx = halls.findIndex(it => it.id === id);
            if (idx === -1) return res.status(404).json({ error: 'not_found' });
            halls.splice(idx, 1);
            writeJSON(hallsPath, halls);
            return res.status(204).send();
          }
          return res.status(204).send();
        } catch (dbErr) {
          logger.warn('DELETE /api/halls/:id DB error, falling back to JSON', dbErr.message);
          const halls = readJSON(hallsPath, []);
          const idx = halls.findIndex(it => it.id === id);
          if (idx === -1) return res.status(404).json({ error: 'not_found' });
          halls.splice(idx, 1);
          writeJSON(hallsPath, halls);
          return res.status(204).send();
        }
      }
      const halls = readJSON(hallsPath, []);
      const idx = halls.findIndex(it => it.id === id);
      if (idx === -1) return res.status(404).json({ error: 'not_found' });
      halls.splice(idx, 1);
      writeJSON(hallsPath, halls);
      return res.status(204).send();
    } catch (e) {
      logger.error('DELETE /api/halls/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
