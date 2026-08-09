const express = require('express');
const router = express.Router();
const PopCatalog = require('../models/PopCatalog');

// GET /api/grail-alerts - Get high-value VIP grail alerts safely
router.get('/', async (req, res) => {
  try {
    const items = await PopCatalog.find({ marketPrice: { $gte: 100 } })
      .sort({ marketPrice: -1 })
      .limit(5);

    res.json(items || []);
  } catch (error) {
    console.error('❌ Fetch Grail Alerts Error:', error);
    res.status(200).json([]);
  }
});

module.exports = router;
