const eventBus = require('../../core/events/eventBus');
const db = require('../../config/db');

// when an order is created, mark the table occupied
// also notify kitchen via websocket
const kds = require('../../app').kds;
const waiter = require('../../app').waiter;

eventBus.on('ORDER_CREATED', async ({ restaurantId, orderId, tableId, customerName, orderType, items, totalAmount, timestamp }) => {
  try {
    // Mark table as occupied if it's a dine-in order with a table
    if (tableId && orderType === 'dine-in') {
      const result = await db.withTenant(restaurantId, client =>
        client.query(
          `UPDATE tables SET status='occupied'
           WHERE id = $1 AND status = 'vacant'
           RETURNING id, name`,
          [tableId]
        )
      );
      if (result.rows.length) {
        const table = result.rows[0];
        console.log(`Table ${table.name} marked occupied for order ${orderId}`);
        
        // Emit to KDS namespace with full order details
        kds.emit('new_order', {
          orderId,
          restaurantId,
          tableId,
          tableName: table.name,
          customerName,
          items,
          totalAmount,
          orderType,
          timestamp
        });
        
        // Emit to waiter namespace for table updates
        waiter.emit('new_order', {
          orderId,
          restaurantId,
          tableId,
          tableName: table.name,
          customerName,
          items,
          totalAmount,
          orderType,
          timestamp
        });
        
        // broadcast table update globally for real-time UI updates
        const { io } = require('../../app');
        io.emit('table_update', { restaurantId, tableId, status: 'occupied' });
      }
    } else {
      // For delivery/takeout orders without table, just notify kitchen
      kds.emit('new_order', {
        orderId,
        restaurantId,
        customerName,
        items,
        totalAmount,
        orderType,
        timestamp
      });
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
