const db = require('../../../config/db');

async function getByMenuItem(restaurantId, menuItemId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM recipes WHERE menu_item_id=$1', [menuItemId])
  );
}

module.exports = { getByMenuItem };
