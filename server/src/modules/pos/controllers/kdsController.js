const db = require('../../../config/db');
const eventBus = require('../../../core/events/eventBus');

// list orders with pending items for kitchen display
async function listOrders(req, res, next) {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      console.error("KDS Fetch Error: No Restaurant ID found in request");
      return res.status(400).json({ error: "Restaurant ID required" });
    }

    const result = await db.query(
      `SELECT 
          o.id as order_id, 
          o.table_id, 
          t.name as table_name,
          oi.id as item_id, 
          oi.created_at as item_created, 
          mi.name as item_name, 
          oi.quantity,
          oi.status as item_status
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN menu_items mi ON mi.id = oi.menu_item_id
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.restaurant_id = $1 
       AND o.status IN ('open', 'pending')
       AND (oi.status = 'pending' OR oi.status IS NULL)
       ORDER BY o.created_at ASC, oi.created_at ASC`,
      [restaurantId]
    );

    console.log(`KDS: Found ${result.rows.length} items for restaurant ${restaurantId}`);
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

module.exports = { listOrders, markReady };
