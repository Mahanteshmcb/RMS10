const db = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'onboarding.sql'), 'utf-8');
  
  try {
    console.log('Running onboarding schema migration...');
    
    // Split by `;` and filter empty queries
    const queries = sql.split(';').map(q => q.trim()).filter(q => q);
    
    for (const query of queries) {
      try {
        await db.query(query);
        console.log(`✓ Executed: ${query.substring(0, 50)}...`);
      } catch (err) {
        // Check if error is because table already exists
        if (err.code === '42P07' || err.message.includes('already exists')) {
          console.log(`⚠ Table already exists: ${query.substring(0, 50)}...`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
