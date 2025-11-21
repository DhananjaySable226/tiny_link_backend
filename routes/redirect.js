const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Link = require('../models/Link');

const linkModel = new Link(db);

// Handle redirects - this should be at the root level in index.js, not here
// Move this to index.js to avoid conflicts
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find the link
    const link = await linkModel.findByCode(code);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Update click count
    await linkModel.updateClicks(code);
    
    // Redirect to the long URL
    res.redirect(302, link.long_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;