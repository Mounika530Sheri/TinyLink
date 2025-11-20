// backend/db.js
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

const poolConfig = {
  connectionString
};

// When connecting to Neon/managed DBs, ensure TLS but skip strict verification
if (connectionString) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = pool;
