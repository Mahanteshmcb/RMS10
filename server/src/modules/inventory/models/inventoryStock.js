const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM inventory_stock ORDER BY raw_material_id')
  );
}

async function upsert(restaurantId, { raw_material_id, quantity, threshold }) {
  return db.withTenant(restaurantId, client =>
    client.query(
      `INSERT INTO inventory_stock(restaurant_id, raw_material_id, quantity, threshold)
       VALUES($1,$2,$3,$4)
       ON CONFLICT(restaurant_id, raw_material_id)
       DO UPDATE SET quantity=$3, threshold=$4 RETURNING *`,
      [restaurantId, raw_material_id, quantity, threshold]
    )
  );
}

async function getLow(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query(
      'SELECT * FROM inventory_stock WHERE threshold > 0 AND quantity < threshold'
    )
  );
}

module.exports = { getAll, upsert };
