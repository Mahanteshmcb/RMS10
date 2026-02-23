const db = require('../../../config/db');

const Dashboard = {
  summary: (restaurantId) => {
    return db.withTenant(restaurantId, async client => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [orders, revenue, tables] = await Promise.all([
        client.query(
          `SELECT COUNT(*) as count FROM orders
            WHERE restaurant_id=$1 AND created_at >= $2
            AND status = 'completed'`,
          [restaurantId, today.toISOString()]
        ),
        client.query(
          `SELECT SUM(oi.quantity * oi.price) as total FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.restaurant_id=$1 AND o.created_at >= $2`,
          [restaurantId, today.toISOString()]
        ),
        client.query(
          `SELECT COUNT(*) as count FROM dining_tables WHERE restaurant_id=$1`,
          [restaurantId]
        ),
      ]);

      return {
        orders_today: orders.rows[0].count,
        revenue_today: revenue.rows[0].total || 0,
        total_tables: tables.rows[0].count,
      };
    });
  },

  activeOrders: (restaurantId) => {
    return db.withTenant(restaurantId, client =>
      client.query(
        `SELECT o.id, o.table_id, o.status, COUNT(oi.id) as item_count,
                SUM(oi.quantity * oi.price) as total
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
          WHERE o.restaurant_id=$1 AND o.status IN ('pending', 'preparing')
          GROUP BY o.id, o.table_id, o.status
          ORDER BY o.created_at`,
        [restaurantId]
      )
    );
  },
};

module.exports = Dashboard;
