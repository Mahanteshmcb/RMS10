const db = require('../../../config/db');

async function getByMenuItem(restaurantId, menuItemId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM item_variants WHERE menu_item_id=$1', [menuItemId])
  );
}

async function create(restaurantId, menuItemId, name, additional_price) {
  return db.withTenant(restaurantId, client =>
    client.query(
      'INSERT INTO item_variants(menu_item_id, name, additional_price) VALUES($1,$2,$3) RETURNING *',
      [menuItemId, name, additional_price]
    )
  );
}

async function update(restaurantId, id, name, additional_price) {
  return db.withTenant(restaurantId, client =>
    client.query(
      'UPDATE item_variants SET name=$1, additional_price=$2 WHERE id=$3 RETURNING *',
      [name, additional_price, id]
    )
  );
}

async function remove(restaurantId, id) {
  return db.withTenant(restaurantId, client =>
    client.query('DELETE FROM item_variants WHERE id=$1', [id])
  );
}

module.exports = { getByMenuItem, create, update, remove };
