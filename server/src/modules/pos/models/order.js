const db = require('../../../config/db');

async function create(restaurantId, tableId, items) {
  // items: [{menu_item_id, variant_id, quantity, price}]
  return db.withTenant(restaurantId, async client => {
    const orderRes = await client.query(
      'INSERT INTO orders(restaurant_id, table_id, status, total) VALUES($1,$2,$3,$4) RETURNING *',
      [restaurantId, tableId, 'open', 0]
    );
    const orderId = orderRes.rows[0].id;
    let total = 0;
    for (const it of items) {
      const linePrice = it.price * it.quantity;
      total += linePrice;
      await client.query(
        `INSERT INTO order_items(order_id, menu_item_id, variant_id, quantity, price)
         VALUES($1,$2,$3,$4,$5)`,
        [orderId, it.menu_item_id, it.variant_id, it.quantity, it.price]
      );
    }
    await client.query('UPDATE orders SET total=$1 WHERE id=$2', [total, orderId]);
    return { order: orderRes.rows[0], total };
  });
}

async function get(restaurantId, orderId) {
  return db.withTenant(restaurantId, async client => {
    const orderRes = await client.query('SELECT * FROM orders WHERE id=$1', [orderId]);
    if (orderRes.rows.length === 0) return null;
    const itemsRes = await client.query('SELECT * FROM order_items WHERE order_id=$1', [orderId]);
    return { order: orderRes.rows[0], items: itemsRes.rows };
  });
}

async function list(restaurantId) {
  return db.withTenant(restaurantId, client =>
    client.query('SELECT * FROM orders ORDER BY created_at DESC')
  );
}

async function updateStatus(restaurantId, orderId, status) {
  return db.withTenant(restaurantId, client =>
    client.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, orderId])
  );
}

async function addItem(restaurantId, orderId, item) {
  // item: {menu_item_id, variant_id, quantity, price}
  return db.withTenant(restaurantId, async client => {
    const linePrice = item.price * item.quantity;
    await client.query(
      `INSERT INTO order_items(order_id, menu_item_id, variant_id, quantity, price)
       VALUES($1,$2,$3,$4,$5)`,
      [orderId, item.menu_item_id, item.variant_id, item.quantity, item.price]
    );
    // update total
    await client.query(
      `UPDATE orders SET total = total + $1 WHERE id=$2`,
      [linePrice, orderId]
    );
  });
}

async function pay(restaurantId, orderId, amountPaid) {
  return db.withTenant(restaurantId, async client => {
    const orderRes = await client.query('SELECT total, status FROM orders WHERE id=$1', [orderId]);
    if (orderRes.rows.length === 0) return null;
    const order = orderRes.rows[0];
    if (order.status !== 'completed') {
      throw new Error('Cannot pay uncompleted order');
    }
    const change = amountPaid - order.total;
    await client.query('UPDATE orders SET status=$1 WHERE id=$2', ['paid', orderId]);
    return { total: order.total, amountPaid, change };
  });
}

module.exports = { create, get, list, updateStatus };
