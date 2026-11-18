const { canPerform } = require('./roles');

function authorize(action) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !canPerform(role, action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  next();
}

module.exports = { authorize, requireSuperAdmin };