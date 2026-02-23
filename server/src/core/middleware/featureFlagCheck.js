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
      if (result.rows.length === 0 || !result.rows[0].enabled) {
        return res.status(403).json({ error: `Module ${moduleName} disabled` });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { checkModule };