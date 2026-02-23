const db = require('../../../config/db');

const Report = {
  salesByDay: (restaurantId, startDate, endDate) => {
    return db.withTenant(restaurantId, client =>
      client.query(
        `SELECT date_trunc('day', o.created_at) AS day,
                SUM(oi.quantity * oi.price) AS total
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
          WHERE o.restaurant_id = $1
            AND o.status = 'completed'
            AND o.created_at BETWEEN $2 AND $3
          GROUP BY day
          ORDER BY day`,
        [restaurantId, startDate, endDate]
      )
    );
  },

  topMenuItems: (restaurantId, limit = 10) => {
    return db.withTenant(restaurantId, client =>
      client.query(
        `SELECT mi.name, SUM(oi.quantity) AS sold
           FROM order_items oi
           JOIN menu_items mi ON oi.menu_item_id = mi.id
          WHERE oi.restaurant_id = $1
          GROUP BY mi.name
          ORDER BY sold DESC
          LIMIT $2`,
        [restaurantId, limit]
      )
    );
  }
};

module.exports = Report;
