// Middleware to extract restaurant (tenant) from request header or JWT token

module.exports = function tenantHandler(req, res, next) {
  // Expect request header `x-restaurant-id` or encoded in JWT
  const restaurantId = req.headers['x-restaurant-id'] || (req.user && req.user.restaurantId);
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID missing' });
  }
  req.restaurantId = restaurantId;
  next();
};