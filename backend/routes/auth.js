const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { LoginSchema, RegisterSchema } = require('../validators/schemas');
const { authenticate, generateTokenPair, refreshAccessToken } = require('../middleware/authenticate');
const { sendWelcomeEmail } = require('../services/emailService');
const { verifyGoogleToken, findOrCreateGoogleUser, sendGoogleWelcomeEmail } = require('../services/googleAuthService');

module.exports = ({ logger, pgClient }) => {
  // Fallback mock user (only used when DB is not configured)
  const mockUsers = [
    { id: 'admin-001', email: 'admin@megapark.com', password: 'admin123', name: 'Admin User', role: 'admin' }
  ];

  const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

  const ensureUsersTable = async () => {
    if (!pgClient) return;
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        name text,
        phone text,
        role text DEFAULT 'customer',
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);
  };

  // Helper to find user by email. If `pgClient` is provided, query the database,
  // otherwise read from `backend/data/users.json` (if present) and fall back to mockUsers.
  const findUserByEmail = async (email) => {
    const lowerEmail = String(email).toLowerCase();
    if (pgClient) {
      try {
        // Wrap query in timeout to prevent hanging on bad connections
        const queryPromise = pgClient.query('SELECT id, email, password_hash AS "passwordHash", name, phone, role, created_at AS "createdAt" FROM users WHERE email = $1 LIMIT 1', [lowerEmail]);
        let timeoutHandle;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('Database query timeout')), 3000);
        });
        let res;
        try {
          res = await Promise.race([queryPromise, timeoutPromise]);
        } finally {
          clearTimeout(timeoutHandle);
        }
        if (res.rows.length > 0) {
          return res.rows[0];
        }
        // if query succeeded but returned no rows, don't immediately give up
        // let the code continue below to check the file-based storage or
        // mockUsers.  this makes deployments safer when the DB is empty
        // (no admin user seeded yet).
      } catch (dbErr) {
        // Fall through to file/mock fallback (don't log, it's expected)
      }
    }

    try {
      const raw = fs.readFileSync(usersFilePath, 'utf8');
      const users = JSON.parse(raw || '[]');
      const u = users.find(x => String(x.email).toLowerCase() === lowerEmail);
      if (u) {
        return {
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash || u.password_hash || null,
          password: u.password || undefined,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          phone: u.phone || null,
          createdAt: u.createdAt || u.created_at || null,
          role: u.role || 'customer'
        };
      }
    } catch (e) {
      // ignore and continue to other fallbacks
    }

    // if there is an `admin-users.json` file (used by the dashboard/admin
    // setup tool) check it too so the web UI can authenticate against
    // that list when no DB user exists yet.
    try {
      const adminPath = path.join(__dirname, '..', 'data', 'admin-users.json');
      const rawAdmin = fs.readFileSync(adminPath, 'utf8');
      const admins = JSON.parse(rawAdmin || '[]');
      const a = admins.find(x => String(x.email).toLowerCase() === lowerEmail);
      if (a) {
        return {
          id: a.id,
          email: a.email,
          passwordHash: a.passwordHash || a.password_hash || null,
          password: a.password || undefined,
          name: a.name || '',
          phone: a.phone || null,
          createdAt: a.createdAt || a.created_at || null,
          role: a.role || 'admin'
        };
      }
    } catch (e) {
      // ignore and fall back to mock
    }

    return mockUsers.find(u => String(u.email).toLowerCase() === lowerEmail) || null;
  };

  router.post('/login', async (req, res) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation error', details: parsed.error.errors });
      }
      const { email, password } = parsed.data;
      
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
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || null,
          role: user.role,
          createdAt: user.createdAt || null
        }
      });
    } catch (e) {
      if (e.name === 'ZodError') return res.status(400).json({ error: 'Validation error', details: e.errors });
      logger.error('Login error', e.message || e.toString());
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Register new user
  router.post('/register', async (req, res) => {
    try {
      // Validate input against schema
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }

      const { email, password, firstName, lastName, phone } = parsed.data;
      const lowerEmail = email.toLowerCase().trim();

      // If using Postgres
      if (pgClient) {
        try {
          await ensureUsersTable();
          const exists = await pgClient.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [lowerEmail]);
          if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'Account already exists' });
          }

          const passwordHash = await bcrypt.hash(password, 10);
          // Use UUID so registration works on DBs where users.id is uuid-typed.
          const id = uuidv4();
          const fullName = `${firstName} ${lastName}`.trim();
          
          await pgClient.query(
            'INSERT INTO users(id, email, password_hash, name, phone, role, is_active, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
            [id, lowerEmail, passwordHash, fullName, phone || null, 'customer', true, new Date()]
          );

          // Send welcome email
          try {
            await sendWelcomeEmail(lowerEmail, fullName);
          } catch (emailErr) {
            logger.warn(`Welcome email failed for ${lowerEmail}:`, emailErr.message);
            // Don't fail the registration if email fails
          }

          logger.info({ email: lowerEmail }, 'New user registered');
          
          return res.status(201).json({ 
            ok: true, 
            message: 'Account created successfully. A welcome email has been sent.',
            user: { id, email: lowerEmail, name: fullName, phone: phone || null, role: 'customer', createdAt: new Date().toISOString() } 
          });
        } catch (dbErr) {
          logger.error('Database error during registration:', dbErr.message);
          if (dbErr.code === '23505') {
            return res.status(409).json({ error: 'Account already exists' });
          }
          return res.status(500).json({
            error: 'Failed to create account',
            details: [{ message: dbErr.message || 'Database registration error' }]
          });
        }
      }

      // Fallback to file-based storage in backend/data/users.json
      const usersPath = path.join(__dirname, '..', 'data', 'users.json');
      let users = [];
      try { 
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8')); 
      } catch (e) { 
        users = []; 
      }
      
      if (users.find(u => u.email === lowerEmail)) {
        return res.status(409).json({ error: 'Account already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const fullName = `${firstName} ${lastName}`.trim();
      const newUser = { 
        id: `user-${Date.now()}`, 
        email: lowerEmail, 
        passwordHash, 
        name: fullName, 
        phone: phone || null, 
        role: 'customer', 
        createdAt: new Date().toISOString() 
      };
      users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

      // Send welcome email
      try {
        await sendWelcomeEmail(lowerEmail, fullName);
      } catch (emailErr) {
        logger.warn(`Welcome email failed for ${lowerEmail}:`, emailErr.message);
        // Don't fail the registration if email fails
      }

      logger.info({ email: lowerEmail }, 'New user registered (file-based)');

      return res.status(201).json({ 
        ok: true,
        message: 'Account created successfully. A welcome email has been sent.',
        user: { id: newUser.id, email: newUser.email, name: newUser.name, phone: newUser.phone || null, role: 'customer', createdAt: newUser.createdAt || null } 
      });
    } catch (e) {
      logger.error('Register error', e.message || e.toString());
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

  // Google OAuth login endpoint
  router.post('/google', async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'ID token required' });
      }

      // Verify Google token
      const googleData = await verifyGoogleToken(idToken);
      logger.info({ email: googleData.email }, 'Google token verified');

      // Find or create user
      const user = await findOrCreateGoogleUser(googleData, pgClient, logger);

      // Generate JWT tokens
      const tokens = generateTokenPair({ 
        id: user.id, 
        email: user.email, 
        role: user.role || 'customer' 
      });

      // Send welcome email to new users
      if (user.created_at && new Date(user.created_at) > new Date(Date.now() - 60000)) {
        // User created less than 60 seconds ago (new user)
        const { sendEmail } = require('../services/emailService');
        await sendGoogleWelcomeEmail(
          user.email,
          user.name || 'User',
          sendEmail
        );
      }

      logger.info({ email: user.email }, 'User authenticated via Google');
      
      return res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phone: user.phone || null,
          role: user.role || 'customer',
          createdAt: user.created_at || user.createdAt || null,
          picture: googleData.picture
        }
      });
    } catch (err) {
      logger.error('Google authentication failed', err.message || err.toString());
      return res.status(401).json({ error: err.message || 'Google authentication failed' });
    }
  });

  // Get authenticated user's profile
  router.get('/me', authenticate, async (req, res) => {
    try {
      const email = req.user?.email;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });

      const user = await findUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name || '',
          phone: user.phone || null,
          role: user.role || 'customer',
          createdAt: user.createdAt || null
        }
      });
    } catch (e) {
      logger.error('Get /auth/me error', e.message || e.toString());
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Update authenticated user's profile data
  router.put('/profile', authenticate, async (req, res) => {
    try {
      const email = req.user?.email;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });

      const name = req.body?.name;
      const phone = req.body?.phone;
      if (!name && !phone) return res.status(400).json({ error: 'At least one field required' });

      if (pgClient) {
        const { rows } = await pgClient.query(
          'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), updated_at = now() WHERE LOWER(email) = $3 RETURNING id, email, name, phone, role, created_at AS "createdAt"',
          [name || null, phone || null, String(email).toLowerCase()]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.json({ user: rows[0] });
      }

      const usersPath = path.join(__dirname, '..', 'data', 'users.json');
      let users = [];
      try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8') || '[]');
      } catch {
        users = [];
      }
      const idx = users.findIndex(u => String(u.email).toLowerCase() === String(email).toLowerCase());
      if (idx === -1) return res.status(404).json({ error: 'User not found' });

      users[idx] = {
        ...users[idx],
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

      return res.json({
        user: {
          id: users[idx].id,
          email: users[idx].email,
          name: users[idx].name,
          phone: users[idx].phone || null,
          role: users[idx].role || 'customer',
          createdAt: users[idx].createdAt || null
        }
      });
    } catch (e) {
      logger.error('PUT /auth/profile error', e.message || e.toString());
      return res.status(500).json({ error: 'server_error' });
    }
  });

  // Change authenticated user's password
  router.put('/change-password', authenticate, async (req, res) => {
    try {
      const email = req.user?.email;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });

      const currentPassword = req.body?.currentPassword;
      const newPassword = req.body?.newPassword;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'currentPassword and newPassword are required' });
      }
      if (String(newPassword).length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }

      const user = await findUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (!user.passwordHash) return res.status(400).json({ error: 'Password change not available for this account type' });

      const matches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!matches) return res.status(401).json({ error: 'Current password is incorrect' });

      const newHash = await bcrypt.hash(newPassword, 10);

      if (pgClient) {
        await pgClient.query(
          'UPDATE users SET password_hash = $1, updated_at = now() WHERE LOWER(email) = $2',
          [newHash, String(email).toLowerCase()]
        );
        return res.json({ ok: true, message: 'Password changed successfully' });
      }

      const usersPath = path.join(__dirname, '..', 'data', 'users.json');
      let users = [];
      try {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8') || '[]');
      } catch {
        users = [];
      }
      const idx = users.findIndex(u => String(u.email).toLowerCase() === String(email).toLowerCase());
      if (idx === -1) return res.status(404).json({ error: 'User not found' });

      users[idx] = { ...users[idx], passwordHash: newHash, updatedAt: new Date().toISOString() };
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      return res.json({ ok: true, message: 'Password changed successfully' });
    } catch (e) {
      logger.error('PUT /auth/change-password error', e.message || e.toString());
      return res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
};
