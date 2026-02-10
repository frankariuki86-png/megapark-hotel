const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { LoginSchema } = require('../validators/schemas');
const { generateTokenPair, refreshAccessToken } = require('../middleware/authenticate');

module.exports = ({ logger, pgClient }) => {
  // Fallback mock user (only used when DB is not configured)
  const mockUsers = [
    { id: 'admin-001', email: 'admin@megapark.com', password: 'admin123', name: 'Admin User', role: 'admin' }
  ];

  // Helper to find user by email. If `pgClient` is provided, query the database, otherwise use mock.
  const findUserByEmail = async (email) => {
    if (pgClient) {
      const res = await pgClient.query('SELECT id, email, password_hash AS "passwordHash", name, role FROM users WHERE email = $1 LIMIT 1', [email]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    }
    return mockUsers.find(u => u.email === email) || null;
  };

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const user = await findUserByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      // For mock users, do direct comparison. For DB users, use bcrypt
      let passwordMatch = false;
      if (user.password) {
        // Mock user - direct comparison
        passwordMatch = (password === user.password);
      } else if (user.passwordHash || user.password_hash) {
        // DB user - use bcrypt
        const hash = user.passwordHash || user.password_hash;
        passwordMatch = await bcrypt.compare(password, hash);
      }

      if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role });
      logger.info({ email: user.email }, 'User logged in');

      return res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    } catch (e) {
      if (e.name === 'ZodError') return res.status(400).json({ error: 'Validation error', details: e.errors });
      logger.error('Login error', e.message || e.toString());
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Refresh endpoint — accepts a refresh token and returns a new token pair
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
      const tokens = refreshAccessToken(refreshToken);
      logger.info({}, 'Token refreshed');
      return res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (e) {
      logger.error('Token refresh error', e.message || e.toString());
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  });

  // Logout endpoint (stateless; client should clear tokens)
  router.post('/logout', (req, res) => {
    logger.info({}, 'User logged out');
    return res.json({ message: 'Logged out successfully' });
  });

  return router;
};
