const db = require('../../../config/db');
const eventBus = require('../../../core/events/eventBus');

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
