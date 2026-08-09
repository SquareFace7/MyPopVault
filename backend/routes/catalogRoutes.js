const express = require('express');
const router = express.Router();
const PopCatalog = require('../models/PopCatalog');

// GET /api/catalog - Get catalog with search and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { series: { $regex: search, $options: 'i' } }
      ];
    }
    if (req.query.category && req.query.category !== 'All') {
      query.series = req.query.category;
    }

    const skip = (page - 1) * limit;
    const total = await PopCatalog.countDocuments(query);
    const items = await PopCatalog.find(query).skip(skip).limit(limit);

    res.json({
      items,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('❌ Fetch Catalog Error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// GET /api/catalog/grail-alerts - Get high-value VIP grail alerts
router.get('/grail-alerts', async (req, res) => {
  try {
    const items = await PopCatalog.find({ marketPrice: { $gte: 100 } })
      .sort({ marketPrice: -1 })
      .limit(5);

    res.json(items);
  } catch (error) {
    console.error('❌ Fetch Grail Alerts Error:', error);
    res.status(500).json({ error: 'Failed to fetch grail alerts' });
  }
});

// GET /api/catalog/:id - Retrieve a single pop from the catalog by ID
router.get('/:id', async (req, res) => {
  try {
    const pop = await PopCatalog.findById(req.params.id);
    if (!pop) {
      return res.status(404).json({ error: 'Pop not found' });
    }
    res.json(pop);
  } catch (error) {
    console.error('❌ Fetch Pop Catalog Item Error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog item' });
  }
});

module.exports = router;
