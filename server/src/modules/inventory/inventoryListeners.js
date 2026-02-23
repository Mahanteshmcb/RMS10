const eventBus = require('../../core/events/eventBus');
const db = require('../../config/db');
const Recipe = require('./models/recipe');

// subtract inventory when order completed
eventBus.on('ORDER_COMPLETED', async ({ restaurantId, orderId }) => {
  try {
    await db.withTenant(restaurantId, async client => {
      // get items
      const itemsRes = await client.query('SELECT menu_item_id, quantity FROM order_items WHERE order_id=$1', [orderId]);
      for (const row of itemsRes.rows) {
        const recRes = await Recipe.getByMenuItem(restaurantId, row.menu_item_id);
        for (const rec of recRes.rows) {
          const amountNeeded = rec.amount * row.quantity;
          // subtract from stock
          await client.query(
            `UPDATE inventory_stock SET quantity = quantity - $1, updated_at = NOW()
             WHERE restaurant_id=$2 AND raw_material_id=$3`,
            [amountNeeded, restaurantId, rec.raw_material_id]
          );
          // check threshold
          const stockRow = await client.query(
            'SELECT quantity, threshold FROM inventory_stock WHERE restaurant_id=$1 AND raw_material_id=$2',
            [restaurantId, rec.raw_material_id]
          );
          if (stockRow.rows.length > 0) {
            const { quantity, threshold } = stockRow.rows[0];
            if (threshold && quantity < threshold) {
              eventBus.emit('LOW_STOCK', { restaurantId, raw_material_id: rec.raw_material_id, quantity });
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error in inventory ORDER_COMPLETED listener:', err);
  }
});
