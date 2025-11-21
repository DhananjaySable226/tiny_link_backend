const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Create a new pool instance with individual parameters
const pool = new Pool({
  user: process.env.DATABASE_USER || '',
  host: process.env.DATABASE_HOST || '',
  database: process.env.DATABASE_NAME || '',
  password: process.env.DATABASE_PASSWORD || '',
  port: process.env.DATABASE_PORT || 5432,
  ssl: false // Disable SSL for local development
});

// Initialize the database
async function initDatabase() {
  let client;
  try {
    // Connect to the database
    client = await pool.connect();
    console.log('Connected to database');
    
    // Execute the schema
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

// Run the initialization
initDatabase();