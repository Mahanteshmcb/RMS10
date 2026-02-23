// Entry point for the backend application

const express = require('express');
const app = express();

app.use(express.json());

const { authMiddleware } = require('./core/auth/jwt');
const { checkModule } = require('./core/middleware/featureFlagCheck');
const tenantHandler = require('./core/middleware/tenantHandler');

// sample health check route
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Example of protected module route
defineRoutes();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function defineRoutes() {
  const express = require('express');
  const posRouter = express.Router();
  // placeholder
  const { authorize } = require('./core/auth/authorize');
  posRouter.get('/test', authorize('view_menu'), (req, res) =>
    res.json({ msg: 'POS works', restaurant: req.restaurantId })
  );

  app.use('/api/pos', authMiddleware, tenantHandler, checkModule('pos'), posRouter);
}