// Middleware to extract restaurant (tenant) from request header or JWT token

module.exports = function tenantHandler(req, res, next) {
  // restaurant ID should ideally come from the authenticated user token
  // header is only used when there is no user (e.g. public browsing)
  let restaurantId;
  if (req.user && req.user.restaurantId) {
    restaurantId = req.user.restaurantId;
  } else {
    restaurantId = req.headers['x-restaurant-id'];
  }
  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID missing' });
  }
  req.restaurantId = restaurantId;
  next();
};