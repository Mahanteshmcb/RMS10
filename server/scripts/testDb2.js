const db = require('../src/config/db');
(async () => {
  try {
    const client = await db.pool.connect();
    try {
      const r = await client.query('SET LOCAL app.current_restaurant = $1', [3]);
      console.log('set result', r);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('err2', e);
  }
})();
