const express = require('express');
const db = require('../config/db');
const QRCode = require('qrcode');

const router = express.Router();

// list public restaurants
router.get('/restaurants', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, slug FROM restaurants');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// fetch restaurant menu and basic info by slug
router.get('/restaurants/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const rest = await db.query('SELECT id, name, slug FROM restaurants WHERE slug=$1', [slug]);
    if (rest.rows.length === 0) return res.status(404).json({ error: 'not found' });
    const restaurantId = rest.rows[0].id;

    // categories list
    const categoriesRes = await db.query(
      'SELECT id, name FROM categories WHERE restaurant_id = $1 ORDER BY name',
      [restaurantId]
    );

    // flat items list
    const itemsRes = await db.query(
      'SELECT id, name, description, base_price AS price, category_id FROM menu_items WHERE restaurant_id = $1 ORDER BY name',
      [restaurantId]
    );

    // payment methods
    const pmRes = await db.query(
      'SELECT method FROM payment_methods WHERE restaurant_id = $1 AND enabled = true',
      [restaurantId]
    );

    res.json({
      restaurant: rest.rows[0],
      categories: categoriesRes.rows,
      items: itemsRes.rows,
      paymentMethods: pmRes.rows.map(r => r.method),
    });
  } catch (err) {
    next(err);
  }
});

// generate QR code for restaurant link
router.get('/qr/restaurant/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/r/${slug}`;
    const img = await QRCode.toDataURL(url);
    const data = img.split(',')[1];
    const buf = Buffer.from(data, 'base64');
    res.type('image/png');
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

// generate QR code for church table (use same slug + table param)
router.get('/qr/restaurant/:slug/table/:tableId', async (req, res, next) => {
  try {
    const { slug, tableId } = req.params;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/r/${slug}?table=${tableId}`;
    const img = await QRCode.toDataURL(url);
    const buf = Buffer.from(img.split(',')[1], 'base64');
    res.type('image/png');
    res.send(buf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
