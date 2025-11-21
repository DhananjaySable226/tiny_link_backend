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
    
    // Skip if it looks like a frontend route
    if (code === 'code' || code === 'favicon.ico') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    // Find the link
    const link = await linkModel.findByCode(code);
    
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Update click count
    const updated = await linkModel.updateClicks(code);
    
    // Redirect to the long URL
    res.redirect(302, link.long_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;