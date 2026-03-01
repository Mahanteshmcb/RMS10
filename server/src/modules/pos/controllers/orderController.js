const Order = require('../models/order');
const eventBus = require('../../../core/events/eventBus');
const db = require('../../../config/db');

async function list(req, res, next) {
  try {
    const status = req.query.status;
    const result = await Order.list(req.restaurantId, status);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const result = await Order.get(req.restaurantId, id);
    if (!result) return res.status(404).end();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    // 1. Extract order data and items
    const {
      table_id: tableId,
      customer_name,
      customer_phone,
      customer_email,
      order_type,
      delivery_address,
      payment_method,
      items = []
    } = req.body;

    // 2. Validate
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Order items must be an array' });
    }

    // 3. Build orderData
    const orderData = {
      tableId,
      customer_name,
      customer_phone,
      customer_email,
      order_type,
      delivery_address,
      payment_method
    };

    // 4. Create order
    const { order, total } = await Order.create(req.restaurantId, orderData, items);

    // 5. Emit creation event for KDS/waiter - include item names for convenience
    const itemsWithNames = [];
    for (const it of items) {
      try {
        const nameRes = await db.query(
          'SELECT name FROM menu_items WHERE id=$1',
          [it.menu_item_id]
        );
        itemsWithNames.push({
          ...it,
          name: nameRes.rows[0]?.name || null
        });
      } catch (_) {
        itemsWithNames.push(it);
      }
    }

    eventBus.emit('ORDER_CREATED', { 
      restaurantId: req.restaurantId, 
      orderId: order.id, 
      tableId,
      customerName: customer_name,
      orderType: order_type,
      items: itemsWithNames,
      totalAmount: total,
    });

    res.status(201).json({ order, total });
  } catch (err) {
    console.error('Create Order Error:', err.message);
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const result = await Order.updateStatus(req.restaurantId, id, status, notes);
    const updated = result.rows[0];

    // emit domain events for important transitions
    if (status === 'completed') {
      eventBus.emit('ORDER_COMPLETED', { restaurantId: req.restaurantId, orderId: id });
    }
    if (status === 'paid') {
      eventBus.emit('ORDER_PAID', { restaurantId: req.restaurantId, orderId: id });
    }

    // broadcast to all socket clients
    try {
      const { io } = require('../../../app');
      io.emit('order_status_updated', {
        orderId: id,
        restaurantId: req.restaurantId,
        status: status,
        timestamp: new Date().toISOString()
      });
    } catch (ioErr) {
      console.error('Socket.io event failed:', ioErr);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function pay(req, res, next) {
  try {
    const { id } = req.params;
    const { amountPaid } = req.body;
    const result = await Order.pay(req.restaurantId, id, amountPaid);
    eventBus.emit('ORDER_PAID', { restaurantId: req.restaurantId, orderId: id });

    try {
      const { io } = require('../../../app');
      io.emit('order_status_updated', {
        orderId: id,
        restaurantId: req.restaurantId,
        status: 'paid',
        timestamp: new Date().toISOString()
      });
    } catch (ioErr) {
      console.error('Socket.io event failed:', ioErr);
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function timeline(req, res, next) {
  try {
    const { id } = req.params;
    const result = await Order.getTimeline(req.restaurantId, id);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, updateStatus, pay, timeline };
