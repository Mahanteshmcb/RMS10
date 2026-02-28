const express = require('express');
const db = require('../config/db');
const eventBus = require('../core/events/eventBus');
const router = express.Router();

// Get restaurant details and menu for public browsing
router.get('/restaurants/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Get restaurant and details
    const restResult = await db.query(
      'SELECT id, name, slug FROM restaurants WHERE slug = $1',
      [slug]
    );

    if (restResult.rows.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurant = restResult.rows[0];
    const restaurantId = restaurant.id;

    // Get categories
    const catResult = await db.query(
      'SELECT id, name FROM categories WHERE restaurant_id = $1 ORDER BY name',
      [restaurantId]
    );

    // Get menu items
    const itemResult = await db.query(
      `SELECT id, category_id, name, description, price, available 
       FROM menu_items 
       WHERE restaurant_id = $1 AND available = true
       ORDER BY name`,
      [restaurantId]
    );

    // Get payment methods
    const payResult = await db.query(
      'SELECT method FROM payment_methods WHERE restaurant_id = $1 AND enabled = true',
      [restaurantId]
    );

    res.json({
      restaurant,
      categories: catResult.rows,
      items: itemResult.rows,
      paymentMethods: payResult.rows.map(p => p.method)
    });
  } catch (err) {
    next(err);
  }
});

// Get payment methods for a restaurant
router.get('/payment-methods/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await db.query(
      `SELECT pm.method FROM payment_methods pm
       JOIN restaurants r ON pm.restaurant_id = r.id
       WHERE r.slug = $1 AND pm.enabled = true`,
      [slug]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create order from public customer
router.post('/orders', async (req, res, next) => {
  const {
    restaurant_slug,
    customer_name,
    customer_phone,
    customer_email,
    order_type,
    delivery_address,
    payment_method,
    items,
    total_amount,
    table_id
  } = req.body;

  if (!restaurant_slug || !customer_name || !customer_phone || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get restaurant
    const restResult = await client.query(
      'SELECT id FROM restaurants WHERE slug = $1',
      [restaurant_slug]
    );

    if (restResult.rows.length === 0) {
      throw new Error('Restaurant not found');
    }

    const restaurantId = restResult.rows[0].id;

    // Verify table if provided
    if (table_id) {
      const tableResult = await client.query(
        'SELECT id FROM tables WHERE id=$1 AND restaurant_id=$2',
        [table_id, restaurantId]
      );
      if (tableResult.rows.length === 0) {
        throw new Error('Table not found');
      }
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders(restaurant_id, table_id, customer_name, customer_phone, customer_email, 
                         order_type, delivery_address, payment_method, status, total_amount, created_at)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, NOW())
       RETURNING id`,
      [restaurantId, table_id || null, customer_name, customer_phone, customer_email || null, 
       order_type, delivery_address || null, payment_method, total_amount]
    );

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items(order_id, menu_item_id, quantity)
         VALUES($1, $2, $3)`,
        [orderId, item.item_id, item.quantity]
      );
    }

    // Record order timeline
    await client.query(
      `INSERT INTO order_timeline(order_id, status, notes)
       VALUES($1, 'created', 'Order created by customer')`,
      [orderId]
    );

    await client.query('COMMIT');

    // Emit event to listeners (orderListeners will handle KDS notifications)
    eventBus.emit('ORDER_CREATED', {
      restaurantId,
      orderId,
      tableId: table_id,
      customerName: customer_name,
      orderType: order_type,
      items: items,
      totalAmount: total_amount,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderId
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.message === 'Restaurant not found' || err.message === 'Table not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  } finally {
    client.release();
  }
});

// Get order status (public)
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const result = await db.query(
      `SELECT id, customer_name, customer_phone, order_type, status, total_amount, 
              created_at, payment_status
       FROM orders WHERE id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.quantity, mi.name, mi.price
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Get timeline
    const timelineResult = await db.query(
      `SELECT status, timestamp, notes FROM order_timeline 
       WHERE order_id = $1 ORDER BY timestamp DESC`,
      [orderId]
    );

    res.json({
      order: result.rows[0],
      items: itemsResult.rows,
      timeline: timelineResult.rows
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
