const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM tables ORDER BY name')
  );
}

async function create(restaurantId, name, seats = 1) {
  return db.withTenant(restaurantId, client =>
    client.query('INSERT INTO tables(restaurant_id, name, seats) VALUES($1,$2,$3) RETURNING *',
      [restaurantId, name, seats])
  );
}

async function update(restaurantId, id, data) {
  const { name, status, seats } = data;
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE tables SET name=$1, status=$2, seats=$3 WHERE id=$4 RETURNING *',
      [name, status, seats, id])
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM tables WHERE id=$1', [id])
  );
}

module.exports = { getAll, create, update, remove };