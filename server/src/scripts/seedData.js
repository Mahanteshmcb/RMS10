// Seed script for RMS database
// Usage: node src/scripts/seedData.js

// load .env before any database code
require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function main() {
  try {
    console.log('🌱 Starting database seed...\n');

    // clear previous data to allow reruns
    console.log('🧹 Truncating existing tables...');
    await db.query(`
        TRUNCATE TABLE inventory_stock, raw_materials, units, tables, menu_items, categories, users, module_config, restaurants RESTART IDENTITY CASCADE;
    `);
    console.log('✅ Tables cleared\n');

    // 1. Create restaurant
    console.log('📍 Creating restaurant...');
    const restaurantRes = await db.query(
      "INSERT INTO restaurants(name) VALUES('Demo Restaurant') RETURNING id"
    );
    const restaurantId = restaurantRes.rows[0].id;
    console.log(`✅ Created restaurant ID: ${restaurantId}\n`);

    // 2. Enable modules for restaurant
    console.log('🔧 Enabling modules...');
    const modules = ['pos', 'inventory', 'kds', 'reporting'];
    for (const m of modules) {
      await db.query(
        'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1,$2,true)',
        [restaurantId, m]
      );
    }
    console.log(`✅ Enabled ${modules.length} modules\n`);

    // 3. Create users
    console.log('👤 Creating users...');
    const users = [
      { username: 'admin', password: 'admin123', role: 'owner' },
      { username: 'manager', password: 'manager123', role: 'manager' },
      { username: 'waiter', password: 'waiter123', role: 'waiter' },
      { username: 'chef', password: 'chef123', role: 'chef' },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await db.query(
        'INSERT INTO users(restaurant_id, username, password_hash, role) VALUES($1,$2,$3,$4)',
        [restaurantId, u.username, hash, u.role]
      );
      console.log(`  ✓ Created user: ${u.username} (${u.role})`);
    }
    console.log();

    // 4. Create categories
    console.log('🏷️  Creating categories...');
    const categoryRes = await db.query(
      `INSERT INTO categories(restaurant_id, name) VALUES
       ($1, 'Main Course'),
       ($1, 'Appetizers'),
       ($1, 'Desserts'),
       ($1, 'Beverages')
       RETURNING id, name`,
      [restaurantId]
    );
    const categories = categoryRes.rows;
    console.log(`✅ Created ${categories.length} categories\n`);

    // 5. Create menu items
    console.log('🍽️  Creating menu items...');
    const mainCatId = categories.find(c => c.name === 'Main Course').id;
    const appetizerCatId = categories.find(c => c.name === 'Appetizers').id;
    const dessertCatId = categories.find(c => c.name === 'Desserts').id;
    const beverageCatId = categories.find(c => c.name === 'Beverages').id;

    const itemsRes = await db.query(
      `INSERT INTO menu_items(restaurant_id, category_id, name, description, base_price)
       VALUES
       ($1, $2, 'Grilled Chicken', 'Marinated grilled chicken with herbs', 450),
       ($1, $2, 'Butter Paneer', 'Paneer in creamy butter sauce', 380),
       ($1, $2, 'Fish Curry', 'Traditional fish curry with coconut', 520),
       ($1, $3, 'Samosa', 'Crispy vegetable samosa with chutney', 80),
       ($1, $3, 'Spring Rolls', 'Crispy spring rolls with sweet sauce', 120),
       ($1, $4, 'Gulab Jamun', 'Sweet milk solids in sugar syrup', 150),
       ($1, $4, 'Kheer', 'Rice pudding with nuts and cardamom', 200),
       ($1, $5, 'Mango Juice', 'Fresh mango juice', 100),
       ($1, $5, 'Lassi', 'Sweet yogurt drink', 80)
       RETURNING id, name, base_price`,
      [restaurantId, mainCatId, appetizerCatId, dessertCatId, beverageCatId]
    );
    console.log(`✅ Created ${itemsRes.rows.length} menu items:\n`);
    itemsRes.rows.forEach(item => {
      console.log(`  ✓ ${item.name} - ₹${item.base_price}`);
    });
    console.log();

    // 6. Create tables
    console.log('🪑 Creating tables...');
    const tablesRes = await db.query(
      `INSERT INTO tables(restaurant_id, name, seats, status)
       VALUES
       ($1, 'T1', 2, 'vacant'),
       ($1, 'T2', 2, 'vacant'),
       ($1, 'T3', 4, 'vacant'),
       ($1, 'T4', 4, 'vacant'),
       ($1, 'T5', 6, 'vacant'),
       ($1, 'T6', 8, 'vacant')
       RETURNING id, name, seats`,
      [restaurantId]
    );
    console.log(`✅ Created ${tablesRes.rows.length} tables:\n`);
    tablesRes.rows.forEach(table => {
      console.log(`  ✓ ${table.name} - ${table.seats} seats`);
    });
    console.log();

    // 7. Create inventory materials
    console.log('📦 Creating inventory materials...');
    const unitsRes = await db.query(
      `INSERT INTO units(restaurant_id, name, abbreviation)
       VALUES
       ($1, 'Kilogram', 'kg'),
       ($1, 'Liter', 'L'),
       ($1, 'Piece', 'pc')
       RETURNING id, name`,
      [restaurantId]
    );
    const units = unitsRes.rows;
    const kgUnitId = units.find(u => u.name === 'Kilogram').id;

    const materialsRes = await db.query(
      `INSERT INTO raw_materials(restaurant_id, name, unit_id)
       VALUES
       ($1, $2, $3),
       ($1, $4, $3),
       ($1, $5, $3),
       ($1, $6, $3)
       RETURNING id, name`,
      [restaurantId, 'Chicken', kgUnitId, 'Paneer', 'Fish', 'Flour']
    );
    console.log(`✅ Created ${materialsRes.rows.length} materials\n`);

    // 8. Create stock entries
    console.log('📊 Creating stock entries...');
    for (const material of materialsRes.rows) {
      await db.query(
        `INSERT INTO inventory_stock(restaurant_id, raw_material_id, quantity, threshold)
         VALUES($1, $2, $3, $4)`,
        [restaurantId, material.id, Math.random() * 50 + 10, 5]
      );
    }
    console.log(`✅ Created inventory stock entries\n`);

    console.log('🎉 Seed completed successfully!\n');
    console.log('📝 Test User Credentials:');
    console.log('  Username: admin        | Password: admin123       | Role: owner');
    console.log('  Username: manager      | Password: manager123     | Role: manager');
    console.log('  Username: waiter       | Password: waiter123      | Role: waiter');
    console.log('  Username: chef         | Password: chef123        | Role: chef');
    console.log('\n🚀 You can now log in to the frontend and test all features!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
