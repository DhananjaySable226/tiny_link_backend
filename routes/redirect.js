const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Link = require('../models/Link');

const linkModel = new Link(db);

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const link = await linkModel.findByCode(code);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await linkModel.updateClicks(code);
    
    res.redirect(302, link.long_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;