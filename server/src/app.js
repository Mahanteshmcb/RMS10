// Entry point for the backend application

const express = require('express');
const app = express();

app.use(express.json());

const { authMiddleware } = require('./core/auth/jwt');
const { checkModule } = require('./core/middleware/featureFlagCheck');
const tenantHandler = require('./core/middleware/tenantHandler');

// sample health check route
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// SuperAdmin routes (no tenant or auth for now - should be secured separately)
const superAdminRouter = require('./routes/superAdmin');
app.use('/api/admin', superAdminRouter);

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
  cors: { origin: '*' }
});

// simple connection log
io.on('connection', socket => {
  console.log('client connected', socket.id);
  socket.on('disconnect', () => console.log('client disconnected', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
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

  // placeholder test route
  posRouter.get('/test', authorize('view_menu'), (req, res) =>
    res.json({ msg: 'POS works', restaurant: req.restaurantId })
  );

  app.use('/api/pos', authMiddleware, tenantHandler, checkModule('pos'), posRouter);
}