const express = require('express');
const db = require('../config/db');
const { authMiddleware } = require('../core/auth/jwt');
const bcrypt = require('bcrypt');

const router = express.Router();

// ======================
// STAFF MANAGEMENT
// ======================

// List staff for restaurant
router.get('/staff', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, phone, role, salary, status, hired_date 
       FROM staff 
       WHERE restaurant_id=$1 
       ORDER BY hired_date DESC`,
      [req.restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create staff & user account
router.post('/staff', authMiddleware, async (req, res, next) => {
  const { name, email, phone, role, salary, hired_date } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email, role required' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Create staff record
    const staffResult = await client.query(
      `INSERT INTO staff(restaurant_id, name, email, phone, role, salary, hired_date, status)
       VALUES($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id`,
      [req.restaurantId, name, email, phone, role, salary, hired_date || new Date()]
    );
    const staffId = staffResult.rows[0].id;

    // Create user account with temp password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hash = await bcrypt.hash(tempPassword, 10);
    const username = email.split('@')[0] + '_' + Math.random().toString(36).slice(-5);

    const userResult = await client.query(
      `INSERT INTO users(restaurant_id, username, password_hash, role)
       VALUES($1, $2, $3, $4)
       RETURNING id`,
      [req.restaurantId, username, hash, role]
    );

    // Link user to staff
    await client.query(
      'UPDATE staff SET user_id=$1 WHERE id=$2',
      [userResult.rows[0].id, staffId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      staffId,
      username,
      tempPassword,
      message: 'Staff created. They should log in and change password immediately',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  } finally {
    client.release();
  }
});

// Update staff
router.put('/staff/:id', authMiddleware, async (req, res, next) => {
  const { name, email, phone, role, salary, status } = req.body;

  try {
    const result = await db.query(
      `UPDATE staff 
       SET name=$1, email=$2, phone=$3, role=$4, salary=$5, status=$6
       WHERE id=$7 AND restaurant_id=$8
       RETURNING *`,
      [name, email, phone, role, salary, status, req.params.id, req.restaurantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete staff
router.delete('/staff/:id', authMiddleware, async (req, res, next) => {
  try {
    await db.query(
      'UPDATE staff SET status=$1 WHERE id=$2 AND restaurant_id=$3',
      ['inactive', req.params.id, req.restaurantId]
    );
    res.json({ message: 'Staff deactivated' });
  } catch (err) {
    next(err);
  }
});

// ======================
// SALARY MANAGEMENT
// ======================

// View staff salary records
router.get('/staff/:id/salary', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM salary_records 
       WHERE staff_id=$1 AND restaurant_id=$2
       ORDER BY month DESC`,
      [req.params.id, req.restaurantId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create salary record
router.post('/salary', authMiddleware, async (req, res, next) => {
  const { staff_id, month, base_salary, bonus, deductions } = req.body;

  try {
    const net = base_salary + bonus - deductions;
    const result = await db.query(
      `INSERT INTO salary_records(staff_id, restaurant_id, month, base_salary, bonus, deductions, net_salary)
       VALUES($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [staff_id, req.restaurantId, month, base_salary, bonus, deductions, net]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update salary status
router.patch('/salary/:id/pay', authMiddleware, async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE salary_records 
       SET payment_status=$1, payment_date=NOW()
       WHERE id=$2 AND restaurant_id=$3
       RETURNING *`,
      ['completed', req.params.id, req.restaurantId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
