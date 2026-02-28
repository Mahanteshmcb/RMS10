const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../core/auth/jwt');
const { makeSlug } = require('../utils/slug');

const router = express.Router();

// ======================
// RESTAURANT REQUESTS (Public)
// ======================

// Submit restaurant onboarding request
router.post('/request', async (req, res, next) => {
  const { name, email, phone, address, city, owner_name } = req.body;
  if (!name || !email || !phone || !address || !city || !owner_name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO restaurant_requests(name, email, phone, address, city, owner_name, status)
       VALUES($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id, status, created_at`,
      [name, email, phone, address, city, owner_name]
    );
    res.status(201).json({
      message: 'Request submitted successfully',
      requestId: result.rows[0].id,
      data: result.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already submitted' });
    }
    next(err);
  }
});

// Get request status
router.get('/request/status/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, status, created_at, approved_at FROM restaurant_requests WHERE id=$1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ======================
// ADMIN ENDPOINTS
// ======================

// List all pending requests
router.get('/admin/requests', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, phone, address, city, owner_name, status, created_at 
       FROM restaurant_requests 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Approve request and generate credentials
router.post('/admin/request/:id/approve', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Get request
    const reqResult = await client.query(
      'SELECT * FROM restaurant_requests WHERE id=$1',
      [id]
    );
    if (reqResult.rows.length === 0) {
      throw new Error('Request not found');
    }

    const request = reqResult.rows[0];
    const slug = makeSlug(request.name) || `r${Date.now()}`;

    // Create restaurant
    const restResult = await client.query(
      'INSERT INTO restaurants(name, slug) VALUES($1,$2) RETURNING id',
      [request.name, slug]
    );
    const restaurantId = restResult.rows[0].id;

    // Enable modules
    const modules = ['pos', 'inventory', 'kds', 'reporting'];
    for (const m of modules) {
      await client.query(
        'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1,$2,true)',
        [restaurantId, m]
      );
    }

    // Create admin user (password will be `admin123` for now, they should change it immediately)
    const bcrypt = require('bcrypt');
    const generatedPassword = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(generatedPassword, 10);
    const userResult = await client.query(
      'INSERT INTO users(restaurant_id, username, password_hash, role) VALUES($1,$2,$3,$4) RETURNING id',
      [restaurantId, request.owner_name.toLowerCase().replace(/\s+/g, '_'), hash, 'owner']
    );

    // Update request status
    await client.query(
      'UPDATE restaurant_requests SET status=$1, approved_at=NOW(), approved_by=$2 WHERE id=$3',
      ['approved', req.user.userId, id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Restaurant approved and created',
      restaurantId,
      restaurantSlug: slug,
      adminUsername: request.owner_name.toLowerCase().replace(/\s+/g, '_'),
      tempPassword: generatedPassword,
      note: 'Owner should change password immediately',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// Reject request
router.post('/admin/request/:id/reject', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    await db.query(
      'UPDATE restaurant_requests SET status=$1 WHERE id=$2',
      ['rejected', id]
    );
    res.json({ message: 'Request rejected', reason });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
