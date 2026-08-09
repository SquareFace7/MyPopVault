const express = require('express');
const router = express.Router();
const PopCatalog = require('../models/PopCatalog');
const VaultItem = require('../models/VaultItem');
const jwt = require('jsonwebtoken');

// GET /api/recommendations - Smart Heuristic Recommendation Engine
router.get('/', async (req, res) => {
  try {
    let userId = null;
    
    // Optional auth token check
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mypopvault_secret');
        userId = decoded.id || decoded._id;
      } catch (e) {
        // Token invalid or expired, continue as guest
      }
    }

    let ownedPopIds = [];
    let seriesCounts = {};

    if (userId) {
      const userVaultItems = await VaultItem.find({ user: userId }).populate('pop');
      if (Array.isArray(userVaultItems)) {
        ownedPopIds = userVaultItems
          .map(item => (item.pop?._id ? item.pop._id.toString() : (item.pop ? item.pop.toString() : null)))
          .filter(Boolean);

        userVaultItems.forEach(item => {
          if (item.pop && item.pop.series) {
            seriesCounts[item.pop.series] = (seriesCounts[item.pop.series] || 0) + (item.quantity || 1);
          }
        });
      }
    }

    const topSeries = Object.keys(seriesCounts).sort((a, b) => seriesCounts[b] - seriesCounts[a]);

    let query = { _id: { $nin: ownedPopIds } };
    if (topSeries.length > 0) {
      query.series = { $in: topSeries.slice(0, 3) };
    }

    let recommendations = await PopCatalog.find(query)
      .sort({ marketPrice: -1, releaseYear: -1 })
      .limit(6);

    if (!recommendations || recommendations.length < 4) {
      const fallbackItems = await PopCatalog.find({ _id: { $nin: ownedPopIds } })
        .sort({ marketPrice: -1 })
        .limit(6);
      recommendations = fallbackItems || [];
    }

    return res.json({
      recommendations: recommendations || [],
      favoriteSeries: topSeries.slice(0, 3)
    });
  } catch (error) {
    console.error('❌ Smart Recommendation Engine Error:', error);
    return res.status(200).json({
      recommendations: [],
      favoriteSeries: []
    });
  }
});

module.exports = router;
