const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM units ORDER BY name')
  );
}

async function create(restaurantId, { name, abbreviation }) {
  return db.withTenant(restaurantId, client =>
    client.query('INSERT INTO units(restaurant_id, name, abbreviation) VALUES($1,$2,$3) RETURNING *',
      [restaurantId, name, abbreviation])
  );
}

async function update(restaurantId, id, { name, abbreviation }) {
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE units SET name=$1, abbreviation=$2 WHERE id=$3 RETURNING *',
      [name, abbreviation, id])
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM units WHERE id=$1', [id])
  );
}

module.exports = { getAll, create, update, remove };
