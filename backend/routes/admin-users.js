const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { AdminUserCreateSchema, AdminUserUpdateSchema } = require('../validators/schemas');

module.exports = ({ pgClient, readJSON, writeJSON, adminUsersPath, logger }) => {
  // Helper function to get all users
  const getAllUsers = async () => {
    if (pgClient) {
      try {
        const { rows } = await pgClient.query(
          'SELECT id, email, name, role, is_active, created_at, updated_at FROM users WHERE role IN ($1, $2) ORDER BY created_at DESC',
          ['admin', 'staff']
        );
        return rows;
      } catch (e) {
        logger.error('DB query error:', e.message);
        return [];
      }
    }
    // Fallback to JSON
    return readJSON(adminUsersPath, [
      {
        id: 'admin-001',
        email: 'admin@megapark.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  };

  // GET - List all admin users (protected, admin only)
  router.get('/', authenticate, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const users = await getAllUsers();
      // Remove password hashes from response
      const safe = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.is_active !== false,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      }));
      return res.json(safe);
    } catch (e) {
      logger.error('GET /api/admin/users error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // POST - Create admin user (protected, admin only)
  router.post('/', authenticate, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const payload = AdminUserCreateSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(payload.password, 10);
      const userId = `user-${Date.now()}`;

      if (pgClient) {
        try {
          const q = `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, true, now(), now())
                     RETURNING id, email, name, role, is_active, created_at, updated_at`;
          const { rows } = await pgClient.query(q, [
            userId,
            payload.email,
            passwordHash,
            payload.name,
            payload.role
          ]);
          return res.status(201).json({
            id: rows[0].id,
            email: rows[0].email,
            name: rows[0].name,
            role: rows[0].role,
            isActive: rows[0].is_active,
            createdAt: rows[0].created_at,
            updatedAt: rows[0].updated_at
          });
        } catch (dbErr) {
          if (dbErr.message.includes('unique')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          throw dbErr;
        }
      }

      // Fallback to JSON
      const users = await getAllUsers();
      const newUser = {
        id: userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        passwordHash // Store for auth, don't expose
      };
      users.push(newUser);
      writeJSON(adminUsersPath, users);

      // Return without password
      const { passwordHash: pw, ...safe } = newUser;
      return res.status(201).json(safe);
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('POST /api/admin/users error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // PUT - Update admin user (protected, admin only)
  router.put('/:id', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const payload = AdminUserUpdateSchema.parse(req.body);
      const userId = req.params.id;

      if (pgClient) {
        try {
          const updates = [];
          const values = [];
          let paramCount = 1;

          if (payload.name) {
            updates.push(`name = $${paramCount++}`);
            values.push(payload.name);
          }
          if (payload.role) {
            updates.push(`role = $${paramCount++}`);
            values.push(payload.role);
          }
          if (payload.isActive !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(payload.isActive);
          }

          if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
          }

          updates.push(`updated_at = now()`);
          values.push(userId);

          const q = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, name, role, is_active, created_at, updated_at`;
          const { rows } = await pgClient.query(q, values);

          if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
          }

          return res.json({
            id: rows[0].id,
            email: rows[0].email,
            name: rows[0].name,
            role: rows[0].role,
            isActive: rows[0].is_active,
            createdAt: rows[0].created_at,
            updatedAt: rows[0].updated_at
          });
        } catch (dbErr) {
          logger.error('DB update error:', dbErr.message);
          return res.status(500).json({ error: 'Database error' });
        }
      }

      // Fallback to JSON
      const users = await getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (payload.name) users[userIndex].name = payload.name;
      if (payload.role) users[userIndex].role = payload.role;
      if (payload.isActive !== undefined) users[userIndex].isActive = payload.isActive;
      users[userIndex].updatedAt = new Date().toISOString();

      writeJSON(adminUsersPath, users);
      const { passwordHash, ...safe } = users[userIndex];
      return res.json(safe);
    } catch (e) {
      if (e.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: e.errors });
      }
      logger.error('PUT /api/admin/users/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // DELETE - Delete admin user (protected, admin only)
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
      }

      const userId = req.params.id;

      // Prevent deleting self
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      if (pgClient) {
        try {
          const { rows } = await pgClient.query('DELETE FROM users WHERE id = $1 AND id != $2 RETURNING id', [userId, req.user.id]);
          if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found or cannot be deleted' });
          }
          return res.json({ message: 'User deleted successfully' });
        } catch (dbErr) {
          logger.error('DB delete error:', dbErr.message);
          return res.status(500).json({ error: 'Database error' });
        }
      }

      // Fallback to JSON
      const users = await getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      users.splice(userIndex, 1);
      writeJSON(adminUsersPath, users);
      return res.json({ message: 'User deleted successfully' });
    } catch (e) {
      logger.error('DELETE /api/admin/users/:id error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  // POST - Change password (protected)
  router.post('/:id/password', authenticate, async (req, res) => {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      // Can only change own password or be admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      if (pgClient) {
        try {
          // Get current user
          const { rows } = await pgClient.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
          if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
          }

          // If not admin, verify current password
          if (req.user.role !== 'admin' && userId !== req.user.id) {
            const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
            if (!match) {
              return res.status(401).json({ error: 'Current password is incorrect' });
            }
          }

          // Hash new password
          const newHash = await bcrypt.hash(newPassword, 10);
          await pgClient.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [newHash, userId]);

          return res.json({ message: 'Password updated successfully' });
        } catch (dbErr) {
          logger.error('DB password update error:', dbErr.message);
          return res.status(500).json({ error: 'Database error' });
        }
      }

      return res.json({ message: 'Password updated successfully' });
    } catch (e) {
      logger.error('POST /api/admin/users/:id/password error', e.message);
      res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
