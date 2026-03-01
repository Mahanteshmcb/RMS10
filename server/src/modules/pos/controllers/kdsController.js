const db = require('../../../config/db');
const eventBus = require('../../../core/events/eventBus');

// list orders with pending items for kitchen display
async function listOrders(req, res, next) {
  try {
    const restaurantId = req.restaurantId;
    
    if (!restaurantId) {
      console.error("KDS Fetch Error: No Restaurant ID found in request", {
        user: req.user,
        headers: req.headers
      });
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
       AND o.status IN ('open', 'pending', 'preparing', 'ready_for_service')
       -- return every line item regardless of its custom status so UI can filter
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
    let orderId;
    await db.withTenant(req.restaurantId, async client => {
      const upd = await client.query(
        'UPDATE order_items SET status=$1 WHERE id=$2 RETURNING order_id',
        ['ready', itemId]
      );
      if (upd.rows.length) {
        orderId = upd.rows[0].order_id;
      }
      // check if all items are now ready
      if (orderId) {
        const pending = await client.query(
          'SELECT COUNT(*) FROM order_items WHERE order_id=$1 AND status <> $2',
          [orderId, 'ready']
        );
        if (parseInt(pending.rows[0].count, 10) === 0) {
          // mark order status ready_for_service
          await client.query('UPDATE orders SET status=$1 WHERE id=$2', ['ready_for_service', orderId]);
          await client.query(
            `INSERT INTO order_timeline(order_id, status, notes)
             VALUES($1,$2,$3)`,
            [orderId, 'ready_for_service', 'All items prepared']
          );

          // fetch order details for waiter notification
          const orderInfo = await client.query(
            `SELECT o.id AS orderId, o.table_id, t.name AS tableName,
                    o.customer_name, o.order_type, o.total_amount
             FROM orders o
             LEFT JOIN tables t ON t.id = o.table_id
             WHERE o.id=$1`,
            [orderId]
          );
          const itemsInfo = await client.query(
            `SELECT oi.quantity, mi.name
             FROM order_items oi
             JOIN menu_items mi ON mi.id = oi.menu_item_id
             WHERE oi.order_id=$1`,
            [orderId]
          );

          const payload = {
            restaurantId: req.restaurantId,
            ...orderInfo.rows[0],
            items: itemsInfo.rows
          };
          const { waiter } = require('../../../app');
          waiter.to(`restaurant_${req.restaurantId}`).emit('order_ready', payload);
          // also broadcast via eventBus for other listeners
          eventBus.emit('ORDER_READY', { restaurantId: req.restaurantId, orderId });
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, markReady };
