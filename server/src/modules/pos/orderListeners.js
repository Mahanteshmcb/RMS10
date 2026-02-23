const eventBus = require('../../core/events/eventBus');
const db = require('../../config/db');

// when an order is created, mark the table occupied
eventBus.on('ORDER_CREATED', async ({ restaurantId, orderId, items }) => {
  try {
    await db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE tables SET status='occupied'
         WHERE id = (SELECT table_id FROM orders WHERE id=$1)
         AND status = 'vacant'`,
        [orderId]
      )
    );
    console.log(`Table marked occupied for order ${orderId}`);
  } catch (err) {
    console.error('Error in ORDER_CREATED listener:', err);
  }
});

// other listeners (inventory, KDS) added in later phases
