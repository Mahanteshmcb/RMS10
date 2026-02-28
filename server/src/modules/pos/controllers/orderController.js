const Order = require('../models/order');
const eventBus = require('../../../core/events/eventBus');

async function list(req, res, next) {
  try {
    const result = await Order.list(req.restaurantId);
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
    const { tableId, items } = req.body;
    const { order, total } = await Order.create(req.restaurantId, tableId, items);
    // emit order created event for internal listeners
    eventBus.emit('ORDER_CREATED', { restaurantId: req.restaurantId, orderId: order.id, items });
    // return created order
    res.status(201).json({ order, total });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await Order.updateStatus(req.restaurantId, id, status);
    const updated = result.rows[0];

    if (status === 'completed') {
      eventBus.emit('ORDER_COMPLETED', { restaurantId: req.restaurantId, orderId: id });
    }

    // Emit Socket.io event for real-time updates to clients
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
    // mark as completed/paid
    const result = await Order.updateStatus(req.restaurantId, id, 'completed');
    eventBus.emit('ORDER_PAID', { restaurantId: req.restaurantId, orderId: id });

    try {
      const { io } = require('../../../app');
      io.emit('order_status_updated', {
        orderId: id,
        restaurantId: req.restaurantId,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } catch (ioErr) {
      console.error('Socket.io event failed:', ioErr);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, updateStatus, pay };
