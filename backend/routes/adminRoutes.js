const express = require('express');
const router = express.Router();
const User = require('../models/User');
const VaultItem = require('../models/VaultItem');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = authMiddleware.authorizeRoles;

// Secure all admin routes
router.use(authMiddleware);
router.use(authorizeRoles('admin'));

// GET /api/admin/stats - Get admin aggregate dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVips = await User.countDocuments({ role: 'vip' });
    const totalPopsVaulted = await VaultItem.countDocuments();
    const totalTrades = 0; // Trades collection is not fully built yet

    // Calculate real cumulative user growth for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthsList = [];
    const tempDate = new Date(sixMonthsAgo);
    for (let i = 0; i < 6; i++) {
      monthsList.push({
        monthNumber: tempDate.getMonth() + 1,
        year: tempDate.getFullYear(),
        month: tempDate.toLocaleString('default', { month: 'short' })
      });
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // Aggregate user creation dates
    const growthAggregation = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Count of users registered prior to the 6-month window to start cumulative count
    const baseUserCount = await User.countDocuments({
      createdAt: { $lt: sixMonthsAgo }
    });

    let cumulativeUsers = baseUserCount;
    const growthData = monthsList.map(m => {
      const match = growthAggregation.find(a => a._id.month === m.monthNumber && a._id.year === m.year);
      const count = match ? match.count : 0;
      cumulativeUsers += count;
      return {
        month: m.month,
        users: cumulativeUsers
      };
    });

    res.json({
      totalUsers,
      totalVips,
      totalPopsVaulted,
      totalTrades,
      growthData
    });
  } catch (error) {
    console.error('❌ Admin Stats Error:', error);
    res.status(500).json({
      error: 'Failed to fetch admin stats',
      message: error.message
    });
  }
});

// GET /api/admin/users - Get list of all registered users with vault counts
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    
    // For each user, get count of items in their vault
    const usersWithCounts = await Promise.all(users.map(async (u) => {
      const popsCount = await VaultItem.countDocuments({ user: u._id });
      return {
        ...u,
        pops: popsCount
      };
    }));

    res.json(usersWithCounts);
  } catch (error) {
    console.error('❌ Admin Fetch Users Error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// PUT /api/admin/users/:id/role - Update user's role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'vip', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be user, vip, or admin'
      });
    }

    // Prevent admin from changing their own role
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot change your own admin role.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      message: `User role successfully updated to ${role}!`,
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Admin Update User Role Error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
});

module.exports = router;
