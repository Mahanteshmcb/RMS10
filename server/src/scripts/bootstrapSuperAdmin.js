require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { makeSlug } = require('../utils/slug');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set before bootstrapping the first admin');
  }

  const [restaurantName = 'RMS Platform', username = 'superadmin'] = process.argv.slice(2);
  const password = crypto.randomBytes(24).toString('base64url');
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const admins = await client.query(
      "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1"
    );
    if (admins.rows.length) {
      throw new Error('A superadmin already exists; refusing to create another bootstrap account');
    }

    let restaurant = await client.query(
      'SELECT id FROM restaurants ORDER BY id LIMIT 1'
    );
    if (!restaurant.rows.length) {
      const slug = makeSlug(restaurantName) || `r${Date.now()}`;
      restaurant = await client.query(
        'INSERT INTO restaurants(name, slug) VALUES($1, $2) RETURNING id',
        [restaurantName, slug]
      );

      for (const moduleName of ['pos', 'inventory', 'kds', 'reporting']) {
        await client.query(
          'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1, $2, true)',
          [restaurant.rows[0].id, moduleName]
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO users(restaurant_id, username, password_hash, role)
       VALUES($1, $2, $3, 'superadmin')`,
      [restaurant.rows[0].id, username, passwordHash]
    );

    await client.query('COMMIT');
    console.log(`Superadmin created for restaurant ID ${restaurant.rows[0].id}`);
    console.log(`Username: ${username}`);
    console.log(`Temporary password: ${password}`);
    console.log('Store the password securely; it is shown only once.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

main().catch(error => {
  console.error('Unable to bootstrap superadmin:', error.message);
  process.exitCode = 1;
});
