const db = require('../src/config/db');
(async () => {
  try {
    const r = await db.withTenant(3, c => c.query('SELECT * FROM categories ORDER BY name'));
    console.log('rows', r.rows);
  } catch (e) {
    console.error('err', e);
  }
})();
