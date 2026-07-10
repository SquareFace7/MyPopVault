const express = require('express');
const router = express.Router();
const VaultItem = require('../models/VaultItem');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/vault - Add a Pop to the user's personal vault
router.post('/', authMiddleware, authMiddleware.requireVerification, async (req, res) => {
  try {
    const { popId } = req.body;

    if (!popId) {
      return res.status(400).json({ error: 'popId is required' });
    }

    const PopCatalog = require('../models/PopCatalog');
    const popCatalogItem = await PopCatalog.findById(popId);
    if (!popCatalogItem) {
      return res.status(404).json({ error: 'Catalog item not found' });
    }

    const newVaultItem = new VaultItem({
      user: req.user._id,
      pop: popId,
      purchasePrice: popCatalogItem.marketPrice || 15
    });

    const savedItem = await newVaultItem.save();
    
    // Populate pop details before returning
    const populatedItem = await savedItem.populate('pop');

    res.status(201).json({
      message: 'Pop successfully added to your vault!',
      vaultItem: populatedItem
    });
  } catch (error) {
    console.error('❌ Vault Add Error:', error);

    // Handle compound index duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate item error',
        message: 'This Pop is already in your vault.'
      });
    }

    res.status(500).json({
      error: 'Failed to add Pop to vault',
      message: error.message
    });
  }
});

// GET /api/vault - Retrieve all vault items for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await VaultItem.find({ user: req.user._id })
      .populate('pop')
      .sort({ addedAt: -1 });

    res.json(items);
  } catch (error) {
    console.error('❌ Vault Retrieve Error:', error);
    res.status(500).json({
      error: 'Failed to fetch vault items',
      message: error.message
    });
  }
});

// DELETE /api/vault/:id - Remove a Pop from the user's personal vault securely
router.delete('/:id', authMiddleware, authMiddleware.requireVerification, async (req, res) => {
  try {
    const vaultItem = await VaultItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!vaultItem) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Vault item not found or you are not authorized to delete this item.'
      });
    }

    res.json({
      message: 'Pop successfully removed from your vault!',
      deletedId: req.params.id
    });
  } catch (error) {
    console.error('❌ Vault Delete Error:', error);
    res.status(500).json({
      error: 'Failed to delete vault item',
      message: error.message
    });
  }
});

// PUT /api/vault/:id - Update vault item details securely
router.put('/:id', authMiddleware, authMiddleware.requireVerification, async (req, res) => {
  try {
    const { purchasePrice, boxCondition, quantity } = req.body;

    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $set: {
          ...(purchasePrice !== undefined && { purchasePrice }),
          ...(boxCondition !== undefined && { boxCondition }),
          ...(quantity !== undefined && { quantity })
        }
      },
      { new: true }
    ).populate('pop');

    if (!vaultItem) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Vault item not found or you are not authorized to update this item.'
      });
    }

    res.json({
      message: 'Pop vault item updated successfully!',
      vaultItem
    });
  } catch (error) {
    console.error('❌ Vault Update Error:', error);
    res.status(500).json({
      error: 'Failed to update vault item',
      message: error.message
    });
  }
});

// GET /api/vault/public/:userId - Retrieve public vault items for a specific user
router.get('/public/:userId', async (req, res) => {
  try {
    const items = await VaultItem.find({ user: req.params.userId })
      .populate('pop')
      .sort({ addedAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('❌ Public Vault Retrieve Error:', error);
    res.status(500).json({
      error: 'Failed to fetch public vault items',
      message: error.message
    });
  }
});

module.exports = router;
