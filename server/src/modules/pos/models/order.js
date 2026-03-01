const db = require('../../../config/db');

async function create(restaurantId, orderData, items) {
  // orderData can contain tableId, customer info, order_type, delivery_address, payment_method
  const {
    tableId,
    customer_name,
    customer_phone,
    customer_email,
    order_type,
    delivery_address,
    payment_method
  } = orderData;

  return db.withTenant(restaurantId, async client => {
    // 1. Create the base order with extra columns if present
    const orderRes = await client.query(
      `INSERT INTO orders(restaurant_id, table_id, status, total, customer_name, customer_phone, customer_email, order_type, delivery_address, payment_method)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        restaurantId,
        tableId,
        'open',
        0,
        customer_name || null,
        customer_phone || null,
        customer_email || null,
        order_type || null,
        delivery_address || null,
        payment_method || null
      ]
    );
    const orderId = orderRes.rows[0].id;
    let total = 0;

    // 2. Process items (same logic)
    for (const it of items) {
      const menuRes = await client.query(
        'SELECT base_price FROM menu_items WHERE id = $1',
        [it.menu_item_id]
      );
      const price = menuRes.rows[0]?.base_price || 0;
      const linePrice = price * it.quantity;
      total += linePrice;

      await client.query(
        `INSERT INTO order_items(order_id, menu_item_id, variant_id, quantity, price)
         VALUES($1,$2,$3,$4,$5)`,
        [orderId, it.menu_item_id, it.variant_id || null, it.quantity, price]
      );
    }

    // 3. Finalize total
    const updatedOrder = await client.query(
      'UPDATE orders SET total=$1 WHERE id=$2 RETURNING *', 
      [total, orderId]
    );
    
    // record timeline entry for creation
    await client.query(
      `INSERT INTO order_timeline(order_id, status, notes)
       VALUES($1,$2,$3)`,
      [orderId, 'created', 'Order created by POS user']
    );

    return { order: updatedOrder.rows[0], total };
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

async function list(restaurantId, status) {
  return db.withTenant(restaurantId, client => {
    let query = 'SELECT * FROM orders';
    const params = [];
    if (status) {
      query += ' WHERE status=$1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    return client.query(query, params);
  });
}

async function updateStatus(restaurantId, orderId, status, notes) {
  return db.withTenant(restaurantId, async client => {
    const result = await client.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, orderId]
    );

    // record timeline entry for every status change
    await client.query(
      `INSERT INTO order_timeline(order_id, status, notes)
       VALUES($1,$2,$3)`,
      [orderId, status, notes || null]
    );

    return result;
  });
}

async function addItem(restaurantId, orderId, item) {
  // item: {menu_item_id, variant_id, quantity}
  return db.withTenant(restaurantId, async client => {
    // 1. Fetch the official price from the database
    const menuRes = await client.query(
      'SELECT base_price FROM menu_items WHERE id = $1',
      [item.menu_item_id]
    );
    
    const price = menuRes.rows[0]?.base_price || 0;
    const linePrice = price * item.quantity;

    // 2. Insert the item with the verified price
    await client.query(
      `INSERT INTO order_items(order_id, menu_item_id, variant_id, quantity, price)
       VALUES($1,$2,$3,$4,$5)`,
      [orderId, item.menu_item_id, item.variant_id || null, item.quantity, price]
    );

    // 3. Update the running total of the order
    await client.query(
      `UPDATE orders SET total = total + $1 WHERE id=$2`,
      [linePrice, orderId]
    );
    
    return { orderId, addedPrice: linePrice };
  });
}

async function pay(restaurantId, orderId, amountPaid) {
  // preserve existing behaviour but record timeline and payment_status
  return db.withTenant(restaurantId, async client => {
    const orderRes = await client.query('SELECT total, status FROM orders WHERE id=$1', [orderId]);
    if (orderRes.rows.length === 0) return null;
    const order = orderRes.rows[0];
    if (order.status !== 'completed' && order.status !== 'billed') {
      throw new Error('Cannot pay uncompleted order');
    }
    const change = amountPaid - order.total;
    await client.query('UPDATE orders SET status=$1, payment_status=$2 WHERE id=$3', ['paid','completed', orderId]);
    await client.query(
      `INSERT INTO order_timeline(order_id, status, notes)
       VALUES($1,$2,$3)`,
      [orderId, 'paid', `Amount paid ${amountPaid}`]
    );
    return { total: order.total, amountPaid, change };
  });
}

async function getTimeline(restaurantId, orderId) {
  return db.withTenant(restaurantId, client =>
    client.query(
      `SELECT status, timestamp, notes FROM order_timeline
       WHERE order_id=$1 ORDER BY timestamp ASC`,
      [orderId]
    )
  );
}

module.exports = { create, get, list, updateStatus, addItem, pay, getTimeline };

