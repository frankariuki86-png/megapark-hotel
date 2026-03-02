require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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

// Log the port Render (or environment) assigns so we can verify
logger.info(`Environment PORT variable: ${process.env.PORT}`);

// Add diagnostic middleware to log all API requests
app.use('/api', (req, res, next) => {
  logger.info(`[API Request] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

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
      // Add a query timeout to prevent hanging queries
      clientOptions.commandTimeout = 5000; // 5 second timeout
      pgClient = new Client(clientOptions);
      
      // Set a connection timeout
      const connectPromise = pgClient.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Postgres connection timeout')), 10000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      logger.info('Connected to Postgres');
    } catch (e) {
      logger.warn(`Postgres connection failed: ${e.message}`);
      // Ensure pgClient is null when connection fails
      pgClient = null;
    }
  }
})();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const menuPath = path.join(dataDir, 'menu.json');
const ordersPath = path.join(dataDir, 'orders.json');

logger.info('Data directory initialized:', dataDir);

const readJSON = (p, fallback) => {
  try {
    if (!fs.existsSync(p)) { 
      fs.writeFileSync(p, JSON.stringify(fallback || [], null, 2)); 
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    logger.warn('readJSON error for', p, e.message);
    return fallback || [];
  }
}
const writeJSON = (p, data) => { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }

// Helper to seed the database with menus, halls, rooms, and admin user
async function seedDatabase(pgClient, logger) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@megapark.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const bcrypt = require('bcrypt');

  try {
    logger.info('seedDatabase: Starting seed process');
    
    // Check what's already in the database
    const menuCountRes = await pgClient.query('SELECT COUNT(*) as count FROM menu_items');
    const roomCountRes = await pgClient.query('SELECT COUNT(*) as count FROM rooms');
    const adminCountRes = await pgClient.query('SELECT COUNT(*) as count FROM users WHERE role=\'admin\'');
    
    const menuCount = parseInt(menuCountRes.rows[0].count, 10);
    const roomCount = parseInt(roomCountRes.rows[0].count, 10);
    const adminCount = parseInt(adminCountRes.rows[0].count, 10);

    logger.info(`seedDatabase: Counts - menu:${menuCount}, rooms:${roomCount}, admin:${adminCount}`);

    // Seed menu items (5 items)
    if (menuCount === 0) {
      logger.info('seedDatabase: Starting menu seed');
      const menuItems = [
        { name: 'Nyama Choma', description: 'Grilled meat with local spices', category: 'mains', price: 850, prep_time: 30 },
        { name: 'Ugali with Sukuma Wiki', description: 'Traditional maize meal with greens', category: 'mains', price: 350, prep_time: 15 },
        { name: 'Samosas', description: 'Crispy pastry with filling', category: 'appetizers', price: 200, prep_time: 10 },
        { name: 'Chapati', description: 'Soft flatbread', category: 'sides', price: 100, prep_time: 8 },
        { name: 'Mango Juice', description: 'Fresh mango juice', category: 'drinks', price: 250, prep_time: 5 }
      ];
      
      for (const item of menuItems) {
        logger.info(`seedDatabase: Inserting menu item: ${item.name}`);
        await pgClient.query(
          'INSERT INTO menu_items (id, name, description, category, price, availability, preparation_time) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [uuidv4(), item.name, item.description, item.category, item.price, true, item.prep_time]
        );
      }
      logger.info('✓ Seeded 5 menu items');
    }

    // Seed rooms (2 items)
    if (roomCount === 0) {
      logger.info('seedDatabase: Starting rooms seed');
      const rooms = [
        {
          name: 'Single Room',
          description: 'Cozy single occupancy room',
          price: 5000,
          capacity: 1
        },
        {
          name: 'Double Room',
          description: 'Comfortable room for two guests',
          price: 8000,
          capacity: 2
        }
      ];
      
      for (const room of rooms) {
        logger.info(`seedDatabase: Inserting room: ${room.name}`);
        await pgClient.query(
          'INSERT INTO rooms (id, name, description, price, capacity) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), room.name, room.description, room.price, room.capacity]
        );
      }
      logger.info('✓ Seeded 2 rooms');
    }

    // Seed admin user
    if (adminCount === 0) {
      logger.info('seedDatabase: Starting admin seed');
      const hash = await bcrypt.hash(adminPassword, 10);
      await pgClient.query(
        'INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
        [`admin-${Date.now()}`, adminEmail, hash, 'Admin User', 'admin', true]
      );
      logger.info('✓ Seeded admin user');
    }

    logger.info('seedDatabase: Completed successfully');
    return {
      ok: true,
      message: 'Seeding complete',
      menuItems: menuCount === 0 ? 5 : menuCount,
      rooms: roomCount === 0 ? 2 : roomCount,
      adminUser: adminEmail
    };
  } catch (e) {
    logger.error('seedDatabase FATAL error:', e.message, e.stack);
    throw e;
  }
}

// Routes
// Routes - with error handling
let authRouter, menuRouter, ordersRouter, paymentsRouter, adminUsersRouter, hallsRouter, roomsRouter, hallQuoteRouter;

try {
  logger.info('Initializing auth router...');
  authRouter = require('./routes/auth')({ logger, pgClient });
  logger.info('✓ Auth router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize auth router:', e.message);
  throw e;
}

try {
  logger.info('Initializing menu router...');
  menuRouter = require('./routes/menu')({ pgClient, readJSON, writeJSON, menuPath, logger });
  logger.info('✓ Menu router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize menu router:', e.message);
  throw e;
}

try {
  logger.info('Initializing orders router...');
  ordersRouter = require('./routes/orders')({ pgClient, readJSON, writeJSON, ordersPath, logger });
  logger.info('✓ Orders router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize orders router:', e.message);
  throw e;
}

const bookingsPath = path.join(dataDir, 'bookings.json');
if (!fs.existsSync(bookingsPath)) fs.writeFileSync(bookingsPath, JSON.stringify([], null, 2));

try {
  logger.info('Initializing payments router...');
  paymentsRouter = require('./routes/payments')({ logger, readJSON, writeJSON, bookingsPath, pgClient });
  logger.info('✓ Payments router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize payments router:', e.message);
  throw e;
}

const adminUsersPath = path.join(dataDir, 'admin-users.json');

try {
  logger.info('Initializing admin users router...');
  adminUsersRouter = require('./routes/admin-users')({ pgClient, readJSON, writeJSON, adminUsersPath, logger });
  logger.info('✓ Admin users router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize admin users router:', e.message);
  throw e;
}

// Halls and Rooms routes
const hallsPath = path.join(dataDir, 'halls.json');
if (!fs.existsSync(hallsPath)) fs.writeFileSync(hallsPath, JSON.stringify([], null, 2));

try {
  logger.info('Initializing halls router...');
  hallsRouter = require('./routes/halls')({ pgClient, readJSON, writeJSON, hallsPath, logger });
  logger.info('✓ Halls router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize halls router:', e.message);
  throw e;
}

const roomsPath = path.join(dataDir, 'rooms.json');
if (!fs.existsSync(roomsPath)) fs.writeFileSync(roomsPath, JSON.stringify([], null, 2));

try {
  logger.info('Initializing rooms router...');
  roomsRouter = require('./routes/rooms')({ pgClient, readJSON, writeJSON, roomsPath, logger });
  logger.info('✓ Rooms router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize rooms router:', e.message);
  throw e;
}

try {
  logger.info('Initializing hall quote router...');
  hallQuoteRouter = require('./routes/hall-quote')({ logger });
  logger.info('✓ Hall quote router initialized');
} catch (e) {
  logger.error('✗ Failed to initialize hall quote router:', e.message);
  throw e;
}

// Validate routers before mounting
const validateRouter = (name, router) => {
  if (!router) {
    throw new Error(`${name} is undefined or null`);
  }
  if (typeof router !== 'function' && !router._router) {
    throw new Error(`${name} is not a valid Express router`);
  }
  logger.info(`✓ ${name} validation passed`);
};

validateRouter('authRouter', authRouter);
validateRouter('menuRouter', menuRouter);
validateRouter('hallsRouter', hallsRouter);
validateRouter('roomsRouter', roomsRouter);
validateRouter('hallQuoteRouter', hallQuoteRouter);
validateRouter('ordersRouter', ordersRouter);
validateRouter('paymentsRouter', paymentsRouter);
validateRouter('adminUsersRouter', adminUsersRouter);

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

// Mount routes with validation
try {
  logger.info('Mounting /api/auth router...');
  app.use('/api/auth', authRouter);
  logger.info('✓ /api/auth mounted');
  
  logger.info('Mounting /api/menu router...');
  app.use('/api/menu', menuRouter);
  logger.info('✓ /api/menu mounted');
  
  logger.info('Mounting /api/halls router...');
  app.use('/api/halls', hallsRouter);
  logger.info('✓ /api/halls mounted');
  
  logger.info('Mounting /api/rooms router...');
  app.use('/api/rooms', roomsRouter);
  logger.info('✓ /api/rooms mounted');
  
  logger.info('Mounting /api/halls/quote router...');
  app.use('/api/halls/quote', hallQuoteRouter);
  logger.info('✓ /api/halls/quote mounted');
  
  logger.info('Mounting /api/orders router...');
  app.use('/api/orders', ordersRouter);
  logger.info('✓ /api/orders mounted');
  
  logger.info('Mounting /api/payments router...');
  app.use('/api/payments', paymentsRouter);
  logger.info('✓ /api/payments mounted');
  
  logger.info('Mounting /api/admin/users router...');
  app.use('/api/admin/users', adminUsersRouter);
  logger.info('✓ /api/admin/users mounted');
} catch (e) {
  logger.error('✗ Error mounting routes:', e.message);
  throw e;
}

logger.info('✓ ALL API ROUTES MOUNTED SUCCESSFULLY ✓');
logger.info('═══════════════════════════════════════════════════');
logger.info('Mounted API Endpoints:');
logger.info('  POST   /api/auth/login');
logger.info('  POST   /api/auth/register');
logger.info('  POST   /api/auth/refresh');
logger.info('  POST   /api/auth/logout');
logger.info('  GET    /api/menu  (public)');
logger.info('  POST   /api/menu  (protected)');
logger.info('  GET    /api/halls (public)');
logger.info('  POST   /api/halls (protected)');
logger.info('  GET    /api/rooms (public)');
logger.info('  POST   /api/rooms (protected)');
logger.info('  GET    /api/orders');
logger.info('  POST   /api/orders');
logger.info('  GET    /api/payments');
logger.info('  POST   /api/payments');
logger.info('  POST   /api/halls/quote');
logger.info('  GET    /api/health');
logger.info('  GET    /api/seed-status');
logger.info('  GET    /api/seed (with ?key=<seed-key>)');
logger.info('  POST   /api/seed (with Authorization header)');
logger.info('═══════════════════════════════════════════════════');

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
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ ok: true, timestamp: new Date().toISOString(), message: 'Backend is healthy' });
});

// Comprehensive route info endpoint
app.get('/api/routes-info', (req, res) => {
  logger.info('Routes info requested');
  res.json({
    message: 'Available API routes',
    routes: ['/api/auth', '/api/menu', '/api/halls', '/api/rooms', '/api/orders', '/api/payments', '/api/admin/users'],
    timestamp: new Date().toISOString()
  });
});

/**
 * Seed endpoint - initializes database with demo data and admin user
 * POST /api/seed - with Authorization header (demo: "demo-key" | retrieve from env SEED_KEY)
 * GET /api/seed-status - check if seeding is needed
 */
app.get('/api/seed-status', async (req, res) => {
  try {
    if (!pgClient) {
      return res.json({ needsSeed: false, reason: 'No database configured' });
    }
    const menuCount = await pgClient.query('SELECT COUNT(*) FROM menu_items');
    const userCount = await pgClient.query('SELECT COUNT(*) FROM users WHERE role=\'admin\'');
    const roomCount = await pgClient.query('SELECT COUNT(*) FROM rooms');
    const needsSeed = menuCount.rows[0].count === 0 || userCount.rows[0].count === 0 || roomCount.rows[0].count === 0;
    res.json({
      needsSeed,
      menuItems: parseInt(menuCount.rows[0].count),
      rooms: parseInt(roomCount.rows[0].count),
      adminUsers: parseInt(userCount.rows[0].count),
      message: needsSeed ? 'Database needs seeding' : 'Database is ready'
    });
  } catch (e) {
    logger.warn('Seed status check failed:', e.message);
    res.json({ needsSeed: true, reason: e.message });
  }
});

// Support both GET and POST for seeding to make it easier for users
// GET: https://backend.com/api/seed?key=demo-key
// POST with Bearer: Authorization: Bearer demo-key
app.get('/api/seed', async (req, res) => {
  try {
    const seedKey = process.env.SEED_KEY || 'demo-key';
    const queryKey = req.query.key || '';

    if (queryKey !== seedKey && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Unauthorized. Provide ?key=demo-key' });
    }

    if (!pgClient) {
      return res.status(400).json({ error: 'No database configured' });
    }

    const result = await seedDatabase(pgClient, logger);
    if (result.already) {
      return res.json({ message: 'Database already seeded', menuItems: result.menuItems });
    }
    return res.json(result);
  } catch (e) {
    logger.error('Seed GET error:', e.message, e.stack);
    res.status(500).json({ error: 'Seeding failed', message: e.message, stack: e.stack });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const seedKey = process.env.SEED_KEY || 'demo-key';
    const authHeader = req.headers.authorization || '';
    const providedKey = authHeader.replace('Bearer ', '');

    if (providedKey !== seedKey && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Unauthorized. Provide Authorization: Bearer demo-key' });
    }

    if (!pgClient) {
      return res.status(400).json({ error: 'No database configured' });
    }

    const result = await seedDatabase(pgClient, logger);
    if (result.already) {
      return res.json({ message: 'Database already seeded', menuItems: result.menuItems });
    }
    return res.json(result);
  } catch (e) {
    logger.error('Seed POST error:', e.message, e.stack);
    res.status(500).json({ error: 'Seeding failed', message: e.message, stack: e.stack });
  }
});

/**
 * POST /api/admin/reset-demo
 * Creates or updates the demo admin user. This is a safe one-off endpoint
 * protected by the same SEED_KEY used for seeding. Accepts optional JSON
 * body: { email, password } to override defaults.
 */
app.post('/api/admin/reset-demo', async (req, res) => {
  try {
    const seedKey = process.env.SEED_KEY || 'demo-key';
    const authHeader = req.headers.authorization || '';
    const providedKey = authHeader.replace('Bearer ', '');

    if (providedKey !== seedKey && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Unauthorized. Provide Authorization: Bearer demo-key' });
    }

    if (!pgClient) {
      return res.status(400).json({ error: 'No database configured' });
    }

    const body = req.body || {};
    const adminEmail = body.email || process.env.ADMIN_EMAIL || 'admin@megapark.com';
    const adminPassword = body.password || process.env.ADMIN_PASSWORD || 'admin123';
    const bcrypt = require('bcrypt');

    const hash = await bcrypt.hash(adminPassword, 10);

    // Upsert admin user: insert or update the password and metadata
    await pgClient.query(
      `INSERT INTO users (id, email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, 'admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = 'admin', is_active = true`,
      [`admin-${Date.now()}`, adminEmail, hash, 'Admin User']
    );

    logger.info('Demo admin ensured:', adminEmail);
    res.json({ ok: true, message: 'Admin created/updated', adminEmail, adminPassword: adminPassword === 'admin123' ? '(default)' : '(custom)' });
  } catch (e) {
    logger.error('Failed to reset demo admin:', e.message);
    res.status(500).json({ error: 'Could not create/update admin', message: e.message });
  }
});

/**
 * POST /api/seed/rooms
 * Idempotent endpoint to ensure demo rooms exist. Protected by SEED_KEY.
 */
app.post('/api/seed/rooms', async (req, res) => {
  try {
    const seedKey = process.env.SEED_KEY || 'demo-key';
    const authHeader = req.headers.authorization || '';
    const providedKey = authHeader.replace('Bearer ', '');

    if (providedKey !== seedKey && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Unauthorized. Provide Authorization: Bearer demo-key' });
    }

    if (!pgClient) return res.status(400).json({ error: 'No database configured' });

    const roomCountRes = await pgClient.query('SELECT COUNT(*) FROM rooms');
    const roomCount = parseInt(roomCountRes.rows[0].count, 10);
    if (roomCount > 0) return res.json({ message: 'Rooms already present', rooms: roomCount });

    const roomsSeeds = [
      {
        room_number: '101',
        name: 'Single Room',
        type: 'single',
        description: 'Cozy single occupancy room',
        price_per_night: 5000,
        capacity: 1,
        amenities: ['wifi'],
        images: [],
        availability: true
      },
      {
        room_number: '201',
        name: 'Double Room',
        type: 'double',
        description: 'Comfortable room for two guests',
        price_per_night: 8000,
        capacity: 2,
        amenities: ['wifi', 'air conditioning'],
        images: [],
        availability: true
      }
    ];

    for (const room of roomsSeeds) {
      await pgClient.query(
        'INSERT INTO rooms (id, room_number, name, type, description, price_per_night, capacity, amenities, images, availability) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [uuidv4(), room.room_number, room.name, room.type, room.description, room.price_per_night, room.capacity, room.amenities, room.images, room.availability]
      );
    }

    const newCountRes = await pgClient.query('SELECT COUNT(*) FROM rooms');
    const newCount = parseInt(newCountRes.rows[0].count, 10);
    logger.info('Seeded rooms:', newCount - roomCount);
    res.json({ ok: true, message: 'Rooms seeded', roomsBefore: roomCount, roomsAfter: newCount });
  } catch (e) {
    logger.error('Seed rooms error:', e.message);
    res.status(500).json({ error: 'Seeding rooms failed', message: e.message });
  }
});

// Serve frontend static files
const frontendDist = path.join(__dirname, '../frontend/dist');
const backendDir = __dirname;
const parentDir = path.join(__dirname, '..');

logger.info('Backend directory:', backendDir);
logger.info('Parent directory:', parentDir);
logger.info(`Looking for frontend dist at: ${frontendDist}`);
logger.info(`Frontend dist exists: ${fs.existsSync(frontendDist)}`);

// List what's in the parent directory for debugging
try {
  const parentContents = fs.readdirSync(parentDir);
  logger.info(`Parent directory contents: ${JSON.stringify(parentContents)}`);
  
  if (fs.existsSync(path.join(parentDir, 'frontend'))) {
    const frontendContents = fs.readdirSync(path.join(parentDir, 'frontend'));
    logger.info(`Frontend directory contents: ${JSON.stringify(frontendContents)}`);
  }
} catch (e) {
  logger.warn(`Error reading directories: ${e.message}`);
}

if (fs.existsSync(frontendDist)) {
  logger.info(`✓ Serving frontend from ${frontendDist}`);
  
  // List files in dist for debugging
  try {
    const distContents = fs.readdirSync(frontendDist);
    logger.info(`Frontend dist contents: ${JSON.stringify(distContents)}`);
  } catch (e) {
    logger.warn(`Error reading dist contents: ${e.message}`);
  }
  
  // Serve static assets (CSS, JS, images, etc.)
  app.use(express.static(frontendDist, {
    maxAge: '1h',
    etag: false
  }));
  
  // SPA fallback - serve index.html for non-API routes
  // This MUST come after all API routes are defined
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      // Let API 404 handler take over
      return next();
    }
    // For all other routes, serve index.html (SPA routing)
    logger.info(`SPA fallback: serving index.html for path: ${req.path}`);
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  logger.error(`❌ Frontend dist folder NOT found at ${frontendDist}`);
  logger.error(`The frontend build may have failed during deployment`);
  logger.error(`Expected path: ${frontendDist}`);
  
  // Fallback: serve a helpful error page
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.status(503).send(`
      <html>
        <head><title>Frontend Not Built</title></head>
        <body style="font-family: monospace; padding: 50px;">
          <h1>⚠️ Frontend Not Available</h1>
          <p>The frontend build was not found at: ${frontendDist}</p>
          <p>Check Render logs to see if the build command failed.</p>
          <hr />
          <p>Expected build command: npm --prefix frontend run build</p>
          <p>Expected output: frontend/dist/</p>
        </body>
      </html>
    `);
  });
}

// 404 handler for API routes that don't exist
app.use('/api', (req, res) => {
  logger.error(`❌ API route NOT FOUND: ${req.method} ${req.path}`);
  logger.error(`   Available API routes:  /auth, /menu, /halls, /rooms, /orders, /payments, /health, /seed, /seed-status`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: 'This API route does not exist. Check /api/routes-info for available endpoints.'
  });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', err.message);
  }
  process.exit(1);
});
