const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get module config for current restaurant
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT module, enabled FROM module_config WHERE restaurant_id = $1',
      [req.restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Toggle or set module enabled state
router.patch('/:module', async (req, res, next) => {
  try {
    const moduleName = req.params.module;
    const { enabled } = req.body;

    // Upsert module_config row
    const result = await db.query(
      `INSERT INTO module_config(restaurant_id, module, enabled)
       VALUES($1,$2,$3)
       ON CONFLICT (restaurant_id, module) DO UPDATE SET enabled = EXCLUDED.enabled
       RETURNING module, enabled`,
      [req.restaurantId, moduleName, enabled]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
