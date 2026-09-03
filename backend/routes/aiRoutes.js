const express = require('express');
const router = express.Router();
const { askAiExpert } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/ai/ask - VIP Exclusive AI Pop Advisor endpoint
router.post('/ask', authMiddleware, authMiddleware.requireVip, askAiExpert);

module.exports = router;
