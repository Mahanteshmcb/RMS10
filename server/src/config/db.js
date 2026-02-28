// database connection helper using pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/rms',
});

/**
 * Standard query using the global pool.
 * Use when tenant (restaurant) is not relevant.
 */
function query(text, params) {
  return pool.query(text, params);
}

/**
 * Execute a callback with the tenant context set on the connection.
 * This relies on RLS policies defined in the database using
 * current_setting('app.current_restaurant')::int.
 */
async function withTenant(restaurantId, callback) {
  if (!restaurantId) throw new Error('restaurantId required');
  const client = await pool.connect();
  try {
    // set the custom GUC for the current tenant; cannot parameterize SET
    await client.query(`SET LOCAL app.current_restaurant = ${Number(restaurantId)}`);
    return await callback(client);
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool,
  withTenant,
};