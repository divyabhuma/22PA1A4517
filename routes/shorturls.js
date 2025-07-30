const express = require('express');
const router = express.Router();
const Url = require('../models/url');

router.post('/', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    const expiry = new Date(Date.now() + (validity || 30) * 60000);

    const exists = await Url.findOne({ shortcode });
    if (exists) return res.status(409).json({ error: 'Shortcode already exists' });

    const newUrl = await Url.create({ originalUrl: url, shortcode, expiry });
    res.status(201).json({
      shortLink: `http://localhost:5000/${shortcode}`,
      expiry: newUrl.expiry.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
