const express = require('express');
const router = express.Router();
const Pop = require('../models/Pop');

// POST /api/pops - Create a new Pop entry
router.post('/', async (req, res) => {
  try {
    const { name, series, image, releaseYear, isVaulted } = req.body;
    
    // Create new instance
    const newPop = new Pop({
      name,
      series,
      image,
      releaseYear,
      isVaulted
    });

    const savedPop = await newPop.save();
    res.status(201).json(savedPop);
  } catch (error) {
    console.error('❌ Error creating Pop:', error);
    res.status(400).json({
      error: 'Failed to create Pop entry',
      message: error.message
    });
  }
});

// GET /api/pops - Fetch all Pop entries
router.get('/', async (req, res) => {
  try {
    const pops = await Pop.find().sort({ addedAt: -1 }); // Newest first
    res.json(pops);
  } catch (error) {
    console.error('❌ Error fetching Pops:', error);
    res.status(500).json({
      error: 'Failed to fetch Pop entries',
      message: error.message
    });
  }
});

module.exports = router;
