// database connection helper using pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/rms',
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};