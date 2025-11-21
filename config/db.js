const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Parse the DATABASE_URL to ensure proper encoding
let poolConfig;
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') 
      ? { rejectUnauthorized: false } 
      : false
  };
} else {
  // Fallback to individual parameters for local development
  poolConfig = {
    user: process.env.DATABASE_USER || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'hotel_management',
    password: process.env.DATABASE_PASSWORD || 'root',
    port: process.env.DATABASE_PORT || 5432,
    ssl: false
  };
}

// Create a new pool instance
const pool = new Pool(poolConfig);

// Auto-create tables on startup
const initializeTables = async () => {
  try {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing tables:', err.message);
  }
};

// Test the database connection and initialize tables
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
    // Initialize tables after successful connection
    initializeTables();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};