const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For Neon with SSL
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
