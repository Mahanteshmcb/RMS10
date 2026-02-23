const db = require('../../../config/db');

const Vendor = {
  create: (restaurantId, data) => {
    const { name, contact_info } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        'INSERT INTO vendors (restaurant_id, name, contact_info) VALUES ($1,$2,$3) RETURNING *',
        [restaurantId, name, contact_info]
      )
    );
  },

  getAll: restaurantId => {
    return db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM vendors')
    );
  },

  getById: (restaurantId, id) => {
    return db.withTenant(restaurantId, client =>
      client.query('SELECT * FROM vendors WHERE id=$1', [id])
    );
  },

  update: (restaurantId, id, data) => {
    const { name, contact_info } = data;
    return db.withTenant(restaurantId, client =>
      client.query(
        'UPDATE vendors SET name=$1, contact_info=$2 WHERE id=$3 RETURNING *',
        [name, contact_info, id]
      )
    );
  },

  delete: (restaurantId, id) => {
    return db.withTenant(restaurantId, client =>
      client.query('DELETE FROM vendors WHERE id=$1', [id])
    );
  }
};

module.exports = Vendor;
