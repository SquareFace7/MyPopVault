const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// PUT /api/users/upgrade/:role - Temporary testing route allowing users to upgrade their own role
router.put('/upgrade/:role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['user', 'vip', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be user, vip, or admin.'
      });
    }

    // Update the authenticated user's role in the database
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { role } },
      { new: true }
    ).select('-password');

    res.json({
      message: `Successfully upgraded to role: ${role}! Please re-authenticate to apply changes.`,
      user
    });
  } catch (error) {
    console.error('❌ User Upgrade Error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

// GET /api/users/public - Retrieve list of all users and their vault counts
router.get('/public', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('username email role');
    const VaultItem = require('../models/VaultItem');
    
    const usersWithVaultSize = await Promise.all(users.map(async (u) => {
      const count = await VaultItem.countDocuments({ user: u._id });
      return {
        _id: u._id,
        username: u.username,
        email: u.email,
        role: u.role,
        collectionSize: count
      };
    }));
    
    res.json(usersWithVaultSize);
  } catch (error) {
    console.error('❌ Fetch Public Collectors Error:', error);
    res.status(500).json({ error: 'Failed to retrieve collectors' });
  }
});

// GET /api/users/:id/profile - Get any user's public profile and vaulted items
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email role');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const VaultItem = require('../models/VaultItem');
    const vaultItems = await VaultItem.find({ user: user._id }).populate('pop');
    res.json({
      user,
      vaultItems
    });
  } catch (error) {
    console.error('❌ Fetch Public Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
