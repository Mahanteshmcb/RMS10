// run as `node src/scripts/createUser.js <username> <password> <role> <restaurantId>`

const bcrypt = require('bcrypt');
const db = require('../../config/db');

async function main() {
  const [username, password, role, restaurantId] = process.argv.slice(2);
  if (!username || !password || !role || !restaurantId) {
    console.error('Usage: node createUser.js <username> <password> <role> <restaurantId>');
    process.exit(1);
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users(username, password_hash, role, restaurant_id) VALUES($1,$2,$3,$4) RETURNING id',
      [username, hash, role, restaurantId]
    );
    console.log('Created user', result.rows[0].id);
  } catch (err) {
    console.error('Error creating user', err);
  } finally {
    process.exit();
  }
}

main();