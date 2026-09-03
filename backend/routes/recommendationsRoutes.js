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

    let aiInsight = null;
    if (process.env.GROQ_API_KEY && recommendations.length > 0) {
      try {
        const Groq = require('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const seriesStr = topSeries.slice(0, 3).join(', ') || 'popular categories';
        const popsStr = recommendations.map(r => r.name).join(', ');

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `The user's top collected series are ${seriesStr}. We are recommending ${popsStr}. Write a single, engaging sentence in English explaining why adding these highly-demanded items is the perfect move to complete their collection. DO NOT make financial predictions or promise future ROI.`
            },
            {
              role: 'user',
              content: 'Generate a single dynamic collection insight sentence.'
            }
          ],
          model: 'qwen/qwen3.8-27b',
        });
        aiInsight = chatCompletion.choices[0]?.message?.content?.trim();
      } catch (err) {
        console.error('AI Insight Error in recommendations route:', err.message);
      }
    }

    if (!aiInsight && recommendations.length > 0) {
      const seriesStr = topSeries.slice(0, 3).join(', ') || 'your favorite categories';
      aiInsight = `Adding these highly-demanded items from ${seriesStr} is the perfect move to complete your collection!`;
    }

    return res.json({
      recommendations: recommendations || [],
      favoriteSeries: topSeries.slice(0, 3),
      aiInsight
    });
  } catch (error) {
    console.error('❌ Smart Recommendation Engine Error:', error);
    return res.status(200).json({
      recommendations: [],
      favoriteSeries: [],
      aiInsight: null
    });
  }
});

module.exports = router;
