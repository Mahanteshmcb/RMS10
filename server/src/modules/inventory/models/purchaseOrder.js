const db = require('../../../config/db');

const PurchaseOrder = {
  create: (restaurantId, data) => {
    const { vendor_id, order_date, status } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `INSERT INTO purchase_orders (restaurant_id, vendor_id, order_date, status)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [restaurantId, vendor_id, order_date, status]
      )
    );
  },

  getAll: restaurantId =>
    db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM purchase_orders ORDER BY order_date DESC')
    ),

  getById: (restaurantId, id) =>
    db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM purchase_orders WHERE id=$1', [id])
    ),

  update: (restaurantId, id, data) => {
    const { vendor_id, order_date, status } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE purchase_orders SET vendor_id=$1, order_date=$2, status=$3
         WHERE id=$4 RETURNING *`,
        [vendor_id, order_date, status, id]
      )
    );
  },

  delete: (restaurantId, id) =>
    db.withTenant(restaurantId, client =>
      client.query('DELETE FROM purchase_orders WHERE id=$1', [id])
    )
};

module.exports = PurchaseOrder;
