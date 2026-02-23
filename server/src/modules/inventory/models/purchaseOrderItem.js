const db = require('../../../config/db');

const PurchaseOrderItem = {
  add: (restaurantId, data) => {
    const { purchase_order_id, raw_material_id, quantity, unit_price } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `INSERT INTO purchase_order_items
         (purchase_order_id, raw_material_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [purchase_order_id, raw_material_id, quantity, unit_price]
      )
    );
  },

  listByOrder: (restaurantId, orderId) =>
    db.withTenant(restaurantId, client =>
      client.query(
        'SELECT * FROM purchase_order_items WHERE purchase_order_id=$1',
        [orderId]
      )
    ),

  update: (restaurantId, id, data) => {
    const { raw_material_id, quantity, unit_price } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE purchase_order_items SET raw_material_id=$1, quantity=$2, unit_price=$3
         WHERE id=$4 RETURNING *`,
        [raw_material_id, quantity, unit_price, id]
      )
    );
  },

  delete: (restaurantId, id) =>
    db.withTenant(restaurantId, client =>
      client.query('DELETE FROM purchase_order_items WHERE id=$1', [id])
    )
};

module.exports = PurchaseOrderItem;
