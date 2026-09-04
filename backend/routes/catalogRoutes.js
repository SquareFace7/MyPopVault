const express = require('express');
const router = express.Router();
const PopCatalog = require('../models/PopCatalog');

// GET /api/catalog - Get catalog with search and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limitQuery = req.query.limit;
    const limit = (limitQuery === 'all' || limitQuery === '0' || parseInt(limitQuery) >= 500)
      ? 1000
      : (parseInt(limitQuery) || 12);
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { series: { $regex: search, $options: 'i' } },
        { itemNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (req.query.category && req.query.category !== 'All') {
      query.series = req.query.category;
    }

    const skip = (page - 1) * limit;
    const total = await PopCatalog.countDocuments(query);
    const items = await PopCatalog.find(query).sort({ marketPrice: -1, name: 1 }).skip(skip).limit(limit);

    res.json({
      items,
      page,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
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

// GET /api/catalog/recommendations - Smart Heuristic Recommendation Engine
router.get('/recommendations', async (req, res) => {
  try {
    const VaultItem = require('../models/VaultItem');
    let userId = null;
    
    // Optional auth token check
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mypopvault_secret');
        userId = decoded.id || decoded._id;
      } catch (e) {}
    }

    let ownedPopIds = [];
    let seriesCounts = {};

    if (userId) {
      const userVaultItems = await VaultItem.find({ user: userId }).populate('pop');
      ownedPopIds = userVaultItems
        .map(item => (item.pop?._id ? item.pop._id.toString() : item.pop?.toString()))
        .filter(Boolean);

      userVaultItems.forEach(item => {
        if (item.pop && item.pop.series) {
          seriesCounts[item.pop.series] = (seriesCounts[item.pop.series] || 0) + (item.quantity || 1);
        }
      });
    }

    const topSeries = Object.keys(seriesCounts).sort((a, b) => seriesCounts[b] - seriesCounts[a]);

    let query = { _id: { $nin: ownedPopIds } };
    if (topSeries.length > 0) {
      query.series = { $in: topSeries.slice(0, 3) };
    }

    let recommendations = await PopCatalog.find(query)
      .sort({ marketPrice: -1, releaseYear: -1 })
      .limit(6);

    if (recommendations.length < 4) {
      const fallbackItems = await PopCatalog.find({ _id: { $nin: ownedPopIds } })
        .sort({ marketPrice: -1 })
        .limit(6);
      recommendations = fallbackItems;
    }

    res.json({
      recommendations,
      favoriteSeries: topSeries.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ Smart Recommendation Engine Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
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
