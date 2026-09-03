const express = require('express');
const router = express.Router();
const { generateRecommendationInsight } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/ai/insight - VIP Exclusive AI Smart Recommendation Insight endpoint
router.post('/insight', authMiddleware, authMiddleware.requireVip, generateRecommendationInsight);

// Legacy/alias route
router.post('/ask', authMiddleware, authMiddleware.requireVip, generateRecommendationInsight);

module.exports = router;
