const express = require('express');
const bcrypt = require('bcrypt');
const { sign } = require('../core/auth/jwt');
const db = require('../config/db');

const router = express.Router();

// register a new user under a restaurant
router.post('/register', async (req, res, next) => {
  const { username, password, role, restaurantId } = req.body;
  if (!username || !password || !role || !restaurantId) {
    return res.status(400).json({ error: 'missing fields' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users(username, password_hash, role, restaurant_id) VALUES($1,$2,$3,$4) RETURNING id, role',
      [username, hash, role, restaurantId]
    );
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'username taken' });
    }
    next(err);
  }
});

// login returns JWT
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  try {
    const result = await db.query('SELECT * FROM users WHERE username=$1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'invalid' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid' });
    const token = sign({ userId: user.id, restaurantId: user.restaurant_id, role: user.role });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;