const db = require('./src/config/db');
(async () => {
  try {
    // ensure image_url column exists before querying
    await db.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT');
    const slug = 'demo-restaurant';
    const rest = await db.query('SELECT id, name, slug FROM restaurants WHERE slug=$1', [slug]);
    console.log('restaurant', rest.rows);
    const restaurantId = rest.rows[0].id;
    const categories = await db.query('SELECT id, name FROM categories WHERE restaurant_id = $1 ORDER BY name', [restaurantId]);
    console.log('categories', categories.rows);
    const items = await db.query(
      'SELECT id, name, description, base_price AS price, category_id, image_url FROM menu_items WHERE restaurant_id = $1 ORDER BY name',
      [restaurantId]
    );
    console.log('items', items.rows);
  } catch (e) {
    console.error('error', e);
  } finally {
    process.exit();
  }
})();
