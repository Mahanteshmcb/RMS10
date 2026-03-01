// Middleware to extract restaurant (tenant) from request header or JWT token

module.exports = function tenantHandler(req, res, next) {
  // restaurant ID should ideally come from the authenticated user token
  // header is only used when there is no user (e.g. public browsing)
  let restaurantId = null;
  if (req.user && req.user.restaurantId) {
    restaurantId = req.user.restaurantId;
  }
  // if token didn't include restaurantId we still allow header override (useful for some clients)
  if ((!restaurantId || restaurantId === null) && req.headers['x-restaurant-id']) {
    restaurantId = req.headers['x-restaurant-id'];
  }
  // coerce to number and validate
  const id = restaurantId !== null ? Number(restaurantId) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    console.error('tenantHandler: invalid restaurantId', restaurantId, 'from user', req.user);
    return res.status(400).json({ error: 'Restaurant ID missing or invalid' });
  }
  // expose both for backward compatibility
  req.restaurantId = id;
  req.tenant = { id };
  next();
};