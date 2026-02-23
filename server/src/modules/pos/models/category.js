const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM categories ORDER BY name')
  );
}

async function create(restaurantId, name) {
  return db.withTenant(restaurantId, client =>
    client.query('INSERT INTO categories(restaurant_id,name) VALUES($1,$2) RETURNING *',
      [restaurantId, name])
  );
}

async function update(restaurantId, id, name) {
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', [name, id])
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM categories WHERE id=$1', [id])
  );
}

module.exports = { getAll, create, update, remove };
