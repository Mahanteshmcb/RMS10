const express = require('express');
const router = express.Router();
const db = require('../config/db');

// NOTE: this route should be protected in real deployments
router.post('/restaurants', async (req, res, next) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  let client;
  try {
    client = await db.pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO restaurants(name) VALUES($1) RETURNING id',
      [name]
    );
    const restaurantId = result.rows[0].id;
    const modules = ['pos', 'inventory', 'kds', 'reporting'];
    for (const m of modules) {
      await client.query(
        'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1,$2,true)',
        [restaurantId, m]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ restaurantId });
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackErr) {
        console.error('rollback failed', rollbackErr);
      }
    }
    next(err);
  } finally {
    if (client) client.release();
  }
});

module.exports = router;