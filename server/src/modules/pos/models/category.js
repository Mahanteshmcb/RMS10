const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM categories ORDER BY name')
  );
}

async function create(restaurantId, name) {
  return db.query(
    'INSERT INTO categories(restaurant_id,name) VALUES($1,$2) RETURNING *',
    [restaurantId, name]
  );
}

module.exports = { getAll, create };
