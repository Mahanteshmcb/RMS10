const db = require('../../../config/db');
const eventBus = require('../../../core/events/eventBus');

// list orders with pending items for kitchen display
async function listOrders(req, res, next) {
  try {
    const result = await db.withTenant(req.restaurantId, client =>
      client.query(
        `SELECT o.id as order_id, o.table_id, oi.id as item_id, oi.created_at as item_created, mi.name as item_name, oi.quantity
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE o.status = 'open' AND oi.status = 'pending'`
      )
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// mark an order item ready
async function markReady(req, res, next) {
  try {
    const { itemId } = req.params;
    await db.withTenant(req.restaurantId, client =>
      client.query('UPDATE order_items SET status=$1 WHERE id=$2 RETURNING *', ['ready', itemId])
    );
    // emit to waiter namespace
    const { waiter } = require('../../../app');
    waiter.emit('item_ready', { restaurantId: req.restaurantId, itemId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { markReady };
