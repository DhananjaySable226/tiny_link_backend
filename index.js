const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const db = require('./config/db');
const Link = require('./models/Link');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/links', require('./routes/links'));

const linkModel = new Link(db);
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (code === 'code' || code === 'favicon.ico') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const link = await linkModel.findByCode(code);
    
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    const updated = await linkModel.updateClicks(code);
    
    res.redirect(302, link.long_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;