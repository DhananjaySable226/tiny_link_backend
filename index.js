const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./config/db');
const Link = require('./models/Link');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Health check endpoint - MUST be before redirect handler
app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/links', require('./routes/links'));

// Handle redirects - should be after API routes and health check
const linkModel = new Link(db);
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`Redirect request received for code: ${code}`);
    
    // Skip if it looks like a frontend route
    if (code === 'code' || code === 'favicon.ico') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Find the link
    const link = await linkModel.findByCode(code);
    
    console.log(`Link found:`, link);
    
    if (!link) {
      // Return 404 if not in production, otherwise continue to frontend
      if (process.env.NODE_ENV === 'production') {
        return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      }
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Update click count
    const updated = await linkModel.updateClicks(code);
    console.log(`Updated link:`, updated);
    
    // Redirect to the long URL
    res.redirect(302, link.long_url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all other routes (in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;