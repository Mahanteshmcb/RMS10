const db = require('../../../config/db');

async function getAll(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM raw_materials ORDER BY name')
  );
}

async function create(restaurantId, { name, unit_id }) {
  return db.withTenant(restaurantId, client =>
    client.query('INSERT INTO raw_materials(restaurant_id,name,unit_id) VALUES($1,$2,$3) RETURNING *',
      [restaurantId, name, unit_id])
  );
}

async function update(restaurantId, id, { name, unit_id }) {
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE raw_materials SET name=$1,unit_id=$2 WHERE id=$3 RETURNING *',
      [name, unit_id, id])
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM raw_materials WHERE id=$1', [id])
  );
}

module.exports = { getAll, create, update, remove };
