const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { HallCreateSchema, HallUpdateSchema } = require('../validators/schemas');

module.exports = ({ pgClient, readJSON, writeJSON, hallsPath, logger }) => {
  logger.info('[hallsRouter] Exported function called');
  
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

          // merge JSON fallback items that aren't in DB yet
          const jsonHalls = readJSON(hallsPath, []);
          if (jsonHalls && jsonHalls.length) {
            // only include those not already returned by DB (by id)
            const dbIds = new Set(rows.map(r => r.id));
            const extra = jsonHalls.filter(h => !dbIds.has(h.id));
            if (extra.length) {
              logger.info('GET /api/halls - adding', extra.length, 'fallback halls to DB result');
              rows.unshift(...extra);
            }
          }

          return res.json(rows);
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
      const payload = HallCreateSchema.parse(req.body);
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
            for (const [k, v] of Object.entries(payload)) {
              if (v === undefined) continue;
              const col = keyMap[k] || k;
              if (!existingCols.includes(col)) continue;
              dbCols.push(col);
              values.push(Array.isArray(v) ? JSON.stringify(v) : v);
            }

            const placeholders = dbCols.map((_, i) => `$${i + 1}`);
            const q = `INSERT INTO halls (${dbCols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING *`;
            const { rows } = await pgClient.query(q, values);
            if (rows && rows[0]) {
              return res.status(201).json(rows[0]);
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
      const payload = HallUpdateSchema.parse(req.body);
      
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
            for (const [k, v] of Object.entries(payload)) {
              if (v === undefined) continue;
              const col = keyMap[k] || k;
              if (!existingCols.includes(col)) continue;
              updates.push(`${col} = $${idx++}`);
              values.push(Array.isArray(v) ? JSON.stringify(v) : v);
            }

            if (updates.length > 0) {
              const q = `UPDATE halls SET ${updates.join(',')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
              values.push(id);
              const { rows } = await pgClient.query(q, values);
              if (rows && rows[0]) {
                return res.json(rows[0]);
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
