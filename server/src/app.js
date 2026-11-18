// Entry point for the backend application

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

const frontendOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in production');
}

if (process.env.NODE_ENV === 'production' && frontendOrigins.length === 0) {
  throw new Error('FRONTEND_URL must contain the deployed frontend origin in production');
}

if (process.env.NODE_ENV !== 'production') {
  frontendOrigins.push('http://localhost:5173', 'http://localhost:5174');
}

app.use(cors({
  origin: frontendOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-restaurant-id'],
}));
app.use(express.json());

// ensure some optional columns exist (runtime migration)
const db = require('./config/db');
(async function ensureSchema() {
  try {
    await db.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;');
    // additional migrations can be added here
  } catch (err) {
    console.error('schema migration error', err.message);
  }
})();

const { authMiddleware, verify } = require('./core/auth/jwt');
const { requireSuperAdmin } = require('./core/auth/authorize');
const { checkModule } = require('./core/middleware/featureFlagCheck');
const tenantHandler = require('./core/middleware/tenantHandler');

// NOTE: POS listeners are imported after socket namespaces are initialized (see below)
// require('./modules/pos/orderListeners');

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check database query failed:', error.message);
    res.status(503).json({ status: 'unavailable' });
  }
});

// public endpoints (no auth) for browsing restaurants & menu
const publicRouter = require('./routes/publicRoutes');
app.use('/api/public', publicRouter);

// public order endpoints (customer ordering)
const publicOrderRouter = require('./routes/publicOrderRoutes');
app.use('/api/public', publicOrderRouter);

// Onboarding routes (request is public, admin endpoints protected)
const onboardingRouter = require('./routes/onboardingRoutes');
app.use('/api/onboarding', onboardingRouter);

// Platform administration is restricted to authenticated superadmins.
const superAdminRouter = require('./routes/superAdmin');
app.use('/api/admin', authMiddleware, requireSuperAdmin, superAdminRouter);

// authentication routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
// Example of protected module route
defineRoutes();

// socket.io setup (for later real-time features)
const http = require('http');
const { Server: SocketIo } = require('socket.io');
const server = http.createServer(app);
const io = new SocketIo(server, {
  cors: { origin: frontendOrigins }
});

function authenticateSocket(socket, next) {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  const user = token && verify(token);
  const restaurantId = Number(user && user.restaurantId);
  const requestedRestaurantId = socket.handshake.query.restaurantId;

  if (!user || !Number.isInteger(restaurantId) || restaurantId <= 0) {
    return next(new Error('Unauthorized'));
  }
  if (requestedRestaurantId && Number(requestedRestaurantId) !== restaurantId) {
    return next(new Error('Forbidden'));
  }

  socket.data.user = user;
  socket.data.restaurantId = restaurantId;
  next();
}

function joinRestaurantRoom(socket) {
  socket.join(`restaurant_${socket.data.restaurantId}`);
}

io.use(authenticateSocket);

// prepare placeholders for namespaces so they can be imported
let kds, waiter;

// simple connection log (global namespace)
io.on('connection', socket => {
  joinRestaurantRoom(socket);
  console.log('client connected', socket.id);
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

// kitchen namespace
kds = io.of('/kds');
kds.use(authenticateSocket);
kds.on('connection', socket => {
  joinRestaurantRoom(socket);
  console.log(`KDS client connected for restaurant ${socket.data.restaurantId}`, socket.id);

  socket.on('disconnect', () => console.log('KDS client disconnected', socket.id));
});

// waiter namespace
waiter = io.of('/waiter');
waiter.use(authenticateSocket);
waiter.on('connection', socket => {
  joinRestaurantRoom(socket);
  console.log(`Waiter client connected for restaurant ${socket.data.restaurantId}`, socket.id);
  socket.on('disconnect', () => console.log('Waiter client disconnected', socket.id));
});

// inventory namespace for stock alerts
let inventory;
inventory = io.of('/inventory');
inventory.use(authenticateSocket);
inventory.on('connection', socket => {
  joinRestaurantRoom(socket);
  console.log('Inventory client connected', socket.id);
  socket.on('disconnect', () => console.log('Inventory client disconnected', socket.id));
});

// export for use in other modules
module.exports = { app, io, kds, waiter, inventory };

// now that namespaces exist, load POS listeners (they may emit to kds)
require('./modules/pos/orderListeners');
// inventory module listens for order events
require('./modules/inventory/inventoryListeners');

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

function defineRoutes() {
  const express = require('express');
  const posRouter = express.Router();
  const { authorize } = require('./core/auth/authorize');
  // wire up category routes
  const categoryRoutes = require('./modules/pos/routes/categoryRoutes');
  posRouter.use('/categories', categoryRoutes);

  // menu items & variants
  const menuItemRoutes = require('./modules/pos/routes/menuItemRoutes');
  posRouter.use('/menu-items', menuItemRoutes);

  // dining tables
  const tableRoutes = require('./modules/pos/routes/tableRoutes');
  posRouter.use('/tables', tableRoutes);

  // orders
  const orderRoutes = require('./modules/pos/routes/orderRoutes');
  posRouter.use('/orders', orderRoutes);

  // kitchen actions
  const kdsRoutes = require('./modules/pos/routes/kdsRoutes');
  posRouter.use('/kds', kdsRoutes);

  // waiter actions
  const waiterRoutes = require('./modules/pos/routes/waiterRoutes');
  posRouter.use('/', waiterRoutes);

  // inventory module (placeholder)
  const inventoryRouter = require('./modules/inventory/routes/inventoryRoutes');
  app.use('/api/inventory', authMiddleware, tenantHandler, checkModule('inventory'), inventoryRouter);

  // reporting module
  const reportingRouter = require('./modules/reporting/routes/reportRoutes');
  app.use('/api/reporting', authMiddleware, tenantHandler, checkModule('reporting'), reportingRouter);

  // staff management module (not a feature flag module)
  const staffRouter = require('./routes/staffRoutes');
  app.use('/api/staff', authMiddleware, tenantHandler, staffRouter);

  // module config management (for settings UI)
  const moduleRouter = require('./routes/moduleRoutes');
  app.use('/api/modules', authMiddleware, tenantHandler, moduleRouter);

  // endpoint to fetch basic restaurant info (name, slug)
  posRouter.get('/restaurant', async (req, res, next) => {
    try {
      const result = await require('./config/db').query(
        'SELECT id, name, slug FROM restaurants WHERE id = $1',
        [req.restaurantId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'not found' });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // update restaurant info (name, email)
  posRouter.put('/restaurant', authorize('manage_menu'), async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const result = await require('./config/db').query(
        'UPDATE restaurants SET name=$1, email=$2 WHERE id=$3 RETURNING id, name, slug, email',
        [name, email, req.restaurantId]
      );
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  // placeholder test route
  posRouter.get('/test', authorize('view_menu'), (req, res) =>
    res.json({ msg: 'POS works', restaurant: req.restaurantId })
  );

  app.use('/api/pos', authMiddleware, tenantHandler, checkModule('pos'), posRouter);
}

// global error handler (logs and sends JSON)
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});