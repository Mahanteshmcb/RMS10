#!/usr/bin/env node

/**
 * Seed Test Data Script
 * Creates test restaurants, users, and sample data
 */

const db = require('../src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Seeding test data...\n');

  try {
    // Get or create test restaurant
    let restaurantResult = await db.query(
      "SELECT id FROM restaurants WHERE slug = 'test-restaurant' LIMIT 1"
    );

    let restaurantId;
    if (restaurantResult.rows.length === 0) {
      console.log('Creating test restaurant...');
      const result = await db.query(
        "INSERT INTO restaurants(name, slug) VALUES('Test Restaurant', 'test-restaurant') RETURNING id"
      );
      restaurantId = result.rows[0].id;
    } else {
      restaurantId = restaurantResult.rows[0].id;
    }

    console.log(`Using restaurant ID: ${restaurantId}`);

    // Enable all modules
    const modules = ['pos', 'inventory', 'kds', 'reporting'];
    for (const m of modules) {
      try {
        await db.query(
          'INSERT INTO module_config(restaurant_id, module, enabled) VALUES($1, $2, true)',
          [restaurantId, m]
        );
        console.log(`✓ Enabled module: ${m}`);
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⚠ Module ${m} already enabled`);
        } else {
          throw err;
        }
      }
    }

    // Create test users
    const testUsers = [
      { username: 'owner1', password: 'password123', role: 'owner' },
      { username: 'manager1', password: 'password123', role: 'manager' },
      { username: 'waiter1', password: 'password123', role: 'waiter' },
      { username: 'chef1', password: 'password123', role: 'chef' },
    ];

    for (const user of testUsers) {
      try {
        const hash = await bcrypt.hash(user.password, 10);
        await db.query(
          'INSERT INTO users(restaurant_id, username, password_hash, role) VALUES($1, $2, $3, $4)',
          [restaurantId, user.username, hash, user.role]
        );
        console.log(`✓ Created user: ${user.username} (${user.role})`);
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⚠ User ${user.username} already exists`);
        } else {
          throw err;
        }
      }
    }

    // Create test payment methods
    const paymentMethods = ['card', 'cash', 'upi'];
    for (const method of paymentMethods) {
      try {
        await db.query(
          'INSERT INTO payment_methods(restaurant_id, method, enabled) VALUES($1, $2, true)',
          [restaurantId, method]
        );
        console.log(`✓ Created payment method: ${method}`);
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⚠ Payment method ${method} already exists`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Seeding completed successfully!');
    console.log('\nTest Credentials:');
    testUsers.forEach(u => {
      console.log(`  - ${u.username} / password123 (${u.role})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
