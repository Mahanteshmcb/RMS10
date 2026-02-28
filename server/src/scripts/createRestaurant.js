// run as `node src/scripts/createRestaurant.js "My Resto"`

const db = require('../../config/db');
const { makeSlug } = require('../utils/slug');

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node createRestaurant.js <name>');
    process.exit(1);
  }
  const slug = makeSlug(name) || `r${Date.now()}`;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query(
      'INSERT INTO restaurants(name, slug) VALUES($1,$2) RETURNING id',
      [name, slug]
    );
    const restaurantId = res.rows[0].id;
    const modules = ['pos', 'inventory', 'kds', 'reporting'];
    for (const m of modules) {
      await client.query(
        'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1,$2,true)',
        [restaurantId, m]
      );
    }
    await client.query('COMMIT');
    console.log('Created restaurant', restaurantId, 'slug:', slug);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating restaurant', err);
  } finally {
    client.release();
    process.exit();
  }
}

main();