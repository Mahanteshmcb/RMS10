const db = require('../../../config/db');

const Recipe = {
  create: (restaurantId, data) => {
    const { menu_item_id, raw_material_id, amount, unit_id } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `INSERT INTO recipes (restaurant_id, menu_item_id, raw_material_id, amount, unit_id)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [restaurantId, menu_item_id, raw_material_id, amount, unit_id]
      )
    );
  },

  getAll: restaurantId =>
    db.withTenant(restaurantId, client => client.query('SELECT * FROM recipes')),

  getById: (restaurantId, id) =>
    db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM recipes WHERE id=$1', [id])
    ),

  update: (restaurantId, id, data) => {
    const { menu_item_id, raw_material_id, amount, unit_id } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        `UPDATE recipes SET menu_item_id=$1, raw_material_id=$2, amount=$3, unit_id=$4
         WHERE id=$5 RETURNING *`,
        [menu_item_id, raw_material_id, amount, unit_id, id]
      )
    );
  },

  delete: (restaurantId, id) =>
    db.withTenant(restaurantId, client =>
      client.query('DELETE FROM recipes WHERE id=$1', [id])
    ),

  getByMenuItem: (restaurantId, menuItemId) =>
    db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM recipes WHERE menu_item_id=$1', [menuItemId])
    )
};

module.exports = Recipe;

