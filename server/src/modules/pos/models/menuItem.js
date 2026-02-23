const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query(
      `SELECT mi.*, c.name as category_name
       FROM menu_items mi
       LEFT JOIN categories c ON mi.category_id = c.id
       ORDER BY mi.name`
    )
  );
}

async function getById(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM menu_items WHERE id=$1', [id])
  );
}

async function create(restaurantId, data) {
  const { category_id, name, description, base_price, tax_rate } = data;
  return db.withTenant(restaurantId, client =>
    client.query(
      `INSERT INTO menu_items(restaurant_id, category_id, name, description, base_price, tax_rate)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [restaurantId, category_id, name, description, base_price, tax_rate]
    )
  );
}

async function update(restaurantId, id, data) {
  const { category_id, name, description, base_price, tax_rate } = data;
  return db.withTenant(restaurantId, client =>
    client.query(
      `UPDATE menu_items
       SET category_id=$1, name=$2, description=$3, base_price=$4, tax_rate=$5
       WHERE id=$6 RETURNING *`,
      [category_id, name, description, base_price, tax_rate, id]
    )
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM menu_items WHERE id=$1', [id])
  );
}

module.exports = { getAll, getById, create, update, remove };
