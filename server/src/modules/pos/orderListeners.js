const eventBus = require('../../core/events/eventBus');
const db = require('../../config/db');

// when an order is created, mark the table occupied
// also notify kitchen via websocket
const kds = require('../../app').kds; // will export later

eventBus.on('ORDER_CREATED', async ({ restaurantId, orderId, items }) => {
  try {
    const result = await db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE tables SET status='occupied'
         WHERE id = (SELECT table_id FROM orders WHERE id=$1)
         AND status = 'vacant'
         RETURNING id`,
        [orderId]
      )
    );
    if (result.rows.length) {
      const tableId = result.rows[0].id;
      console.log(`Table ${tableId} marked occupied for order ${orderId}`);
      // emit to kitchen namespace
      kds.emit('new_order', { restaurantId, orderId, items });
      // also broadcast table update globally
      const { io } = require('../../app');
      io.emit('table_update', { restaurantId, tableId, status: 'occupied' });
    }
  } catch (err) {
    console.error('Error in ORDER_CREATED listener:', err);
  }
});

// when order is completed, mark table billed

eventBus.on('ORDER_COMPLETED', async ({ restaurantId, orderId }) => {
  try {
    const result = await db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE tables SET status='billed'
         WHERE id = (SELECT table_id FROM orders WHERE id=$1)
         AND status = 'occupied'
         RETURNING id`,
        [orderId]
      )
    );
    if (result.rows.length) {
      const tableId = result.rows[0].id;
      console.log(`Table ${tableId} marked billed for order ${orderId}`);
      const { io } = require('../../app');
      io.emit('table_update', { restaurantId, tableId, status: 'billed' });
    }
  } catch (err) {
    console.error('Error in ORDER_COMPLETED listener:', err);
  }
});

// when payment received free the table
eventBus.on('ORDER_PAID', async ({ restaurantId, orderId }) => {
  try {
    const result = await db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE tables SET status='vacant'
         WHERE id = (SELECT table_id FROM orders WHERE id=$1)
         AND status = 'billed'
         RETURNING id`,
        [orderId]
      )
    );
    if (result.rows.length) {
      const tableId = result.rows[0].id;
      console.log(`Table freed after payment for order ${orderId}`);
      const { io } = require('../../app');
      io.emit('table_update', { restaurantId, tableId, status: 'vacant' });
    }
  } catch (err) {
    console.error('Error in ORDER_PAID listener:', err);
  }
});

// other listeners (inventory, KDS) added in later phases
