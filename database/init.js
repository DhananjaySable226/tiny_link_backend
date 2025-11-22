const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const pool = new Pool({
  user: process.env.DATABASE_USER || '',
  host: process.env.DATABASE_HOST || '',
  database: process.env.DATABASE_NAME || '',
  password: process.env.DATABASE_PASSWORD || '',
  port: process.env.DATABASE_PORT || 5432,
  ssl: false
});

async function initDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database');
    
    await client.query(schema);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

initDatabase();