const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET /api/chat/history - Fetch past messages (limit to 100 for performance)
router.get('/history', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(100);
    // Return in chronological order (earliest first)
    res.json(messages.reverse());
  } catch (error) {
    console.error('❌ Fetch Chat History Error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;
