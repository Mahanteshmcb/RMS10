const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM tables ORDER BY name')
  );
}

async function create(restaurantId, name) {
  return db.withTenant(restaurantId, client =>
    client.query('INSERT INTO tables(restaurant_id, name) VALUES($1,$2) RETURNING *',
      [restaurantId, name])
  );
}

async function update(restaurantId, id, data) {
  const { name, status } = data;
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE tables SET name=$1, status=$2 WHERE id=$3 RETURNING *',
      [name, status, id])
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM tables WHERE id=$1', [id])
  );
}

module.exports = { getAll, create, update, remove };