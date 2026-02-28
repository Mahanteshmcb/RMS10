// Middleware factory to check module enablement via ModuleConfig table

const db = require('../../config/db');

function checkModule(moduleName) {
  return async function (req, res, next) {
    const restaurantId = req.restaurantId;
    try {
      const result = await db.query(
        'SELECT enabled FROM module_config WHERE restaurant_id=$1 AND module=$2',
        [restaurantId, moduleName]
      );

      // allow owners and managers to access module routes even if module flag not enabled
      const bypassRoles = ['owner', 'manager'];
      const userRole = req.user && req.user.role;

      if (result.rows.length === 0 || !result.rows[0].enabled) {
        if (userRole && bypassRoles.includes(userRole)) {
          return next();
        }
        return res.status(403).json({ error: `Module ${moduleName} disabled` });
      }
      return next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { checkModule };