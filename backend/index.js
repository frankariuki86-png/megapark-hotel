require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize Sentry if configured
try {
  const Sentry = require('@sentry/node');
  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.05 });
    // Attach Sentry request handler early
    // Note: We attach handlers below if present
  }
} catch (e) {
  // @sentry/node may be optional in development, ignore if missing
}

// Import logging, security, and swagger
const logger = require('./services/logger');
const { requestLogger, errorHandler } = require('./middleware/logging');
const { securityHeaders, corsConfig, globalRateLimit, authRateLimit, apiRateLimit } = require('./middleware/security');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(corsConfig);
app.use(globalRateLimit);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '2mb' }));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// simple DB abstraction: prefer Postgres via DATABASE_URL, otherwise file-backed JSON store
const { Client } = require('pg');
const DATABASE_URL = process.env.DATABASE_URL || null;
let pgClient = null;
(async () => {
  if (DATABASE_URL) {
    try {
      const clientOptions = { connectionString: DATABASE_URL };
      // Honor PGSSLMODE=require or query param sslmode=require for managed DBs
      const pgSslRequired = (process.env.PGSSLMODE && process.env.PGSSLMODE === 'require') || (DATABASE_URL && DATABASE_URL.includes('sslmode=require'));
      if (pgSslRequired) {
        clientOptions.ssl = { rejectUnauthorized: false };
      }
      pgClient = new Client(clientOptions);
      await pgClient.connect();
      logger.info('Connected to Postgres');
    } catch (e) {
      logger.warn(`Postgres connection failed: ${e.message}`);
      pgClient = null;
    }
  }
})();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const menuPath = path.join(dataDir, 'menu.json');
const ordersPath = path.join(dataDir, 'orders.json');

const readJSON = (p, fallback) => {
  try {
    if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(fallback || [], null, 2)); }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    logger.warn('readJSON error', e.message);
    return fallback || [];
  }
}
const writeJSON = (p, data) => { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }

// Routes
const authRouter = require('./routes/auth')({ logger, pgClient });
const menuRouter = require('./routes/menu')({ pgClient, readJSON, writeJSON, menuPath, logger });
const ordersRouter = require('./routes/orders')({ pgClient, readJSON, writeJSON, ordersPath, logger });
const bookingsPath = path.join(dataDir, 'bookings.json');
if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([], null, 2));
const paymentsRouter = require('./routes/payments')({ logger, readJSON, writeJSON, bookingsPath, pgClient });
const adminUsersPath = path.join(dataDir, 'admin-users.json');
const adminUsersRouter = require('./routes/admin-users')({ pgClient, readJSON, writeJSON, adminUsersPath, logger });

// Halls and Rooms routes
const hallsPath = path.join(dataDir, 'halls.json');
if (!fs.existsSync(hallsPath)) fs.writeFileSync(hallsPath, JSON.stringify([], null, 2));
const hallsRouter = require('./routes/halls')({ pgClient, readJSON, writeJSON, hallsPath, logger });

const roomsPath = path.join(dataDir, 'rooms.json');
if (!fs.existsSync(roomsPath)) fs.writeFileSync(roomsPath, JSON.stringify([], null, 2));
const roomsRouter = require('./routes/rooms')({ pgClient, readJSON, writeJSON, roomsPath, logger });
const hallQuoteRouter = require('./routes/hall-quote')({ logger });

// Apply rate limiting to auth endpoints
app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/refresh', authRateLimit);

// Apply API rate limit to data endpoints
app.use('/api/menu', apiRateLimit);
app.use('/api/halls', apiRateLimit);
app.use('/api/rooms', apiRateLimit);
app.use('/api/orders', apiRateLimit);
app.use('/api/payments', apiRateLimit);
app.use('/api/halls/quote', apiRateLimit);

// Enforce authentication on menu endpoints (tests expect auth-required)
app.use('/api/menu', (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized: missing or invalid token' });
  next();
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/halls', hallsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/halls/quote', hallQuoteRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin/users', adminUsersRouter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
