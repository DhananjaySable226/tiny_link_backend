const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const poolConfig = {
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new Pool(poolConfig);
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

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully');
    initializeTables();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};