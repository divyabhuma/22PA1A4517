const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getUrlStats,
  redirectShortcode,
} = require('../controllers/urlController');

router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode', getUrlStats);
router.get('/:shortcode', redirectShortcode);

module.exports = router;
