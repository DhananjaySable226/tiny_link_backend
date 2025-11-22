const express = require('express');
const router = express.Router();
const db = require('../config/db');
const Link = require('../models/Link');

const linkModel = new Link(db);

router.post('/', async (req, res) => {
  try {
    const { longUrl, customCode } = req.body;
    
    if (!longUrl) {
      return res.status(400).json({ error: 'Long URL is required' });
    }
    
    const newLink = await linkModel.create(longUrl, customCode);
    res.status(201).json(newLink);
  } catch (error) {
    if (error.message === 'Shortcode already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const links = await linkModel.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const stats = await linkModel.getStats(code);
    
    if (!stats) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const deletedLink = await linkModel.deleteByCode(code);
    
    if (!deletedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;