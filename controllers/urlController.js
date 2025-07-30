const Url = require('../models/url');
const crypto = require('crypto');

const generateShortcode = () => crypto.randomBytes(4).toString('hex');

exports.createShortUrl = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const code = shortcode || generateShortcode();
  const expiry = new Date(Date.now() + validity * 60 * 1000);

  try {
    const exists = await Url.findOne({ shortcode: code });
    if (exists) return res.status(409).json({ error: 'Shortcode already in use' });

    const newUrl = await Url.create({ originalUrl: url, shortcode: code, expiry });
    res.status(201).json({
      shortLink: `http://localhost:${process.env.PORT}/${code}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.redirectShortcode = async (req, res) => {
  const { shortcode } = req.params;

  try {
    const url = await Url.findOne({ shortcode });
    if (!url) return res.status(404).json({ error: 'Shortcode not found' });

    if (new Date() > url.expiry)
      return res.status(410).json({ error: 'Shortcode expired' });

    url.clicks.push({
      timestamp: new Date(),
      referrer: req.get('Referer') || 'direct',
      geo: 'IN', // fake
    });

    await url.save();
    res.redirect(url.originalUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUrlStats = async (req, res) => {
  const { shortcode } = req.params;
  try {
    const url = await Url.findOne({ shortcode });
    if (!url) return res.status(404).json({ error: 'Shortcode not found' });

    res.json({
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      expiry: url.expiry,
      totalClicks: url.clicks.length,
      clicks: url.clicks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
