const express = require('express');
const router = express.Router();
const TradeOffer = require('../models/TradeOffer');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = authMiddleware.authorizeRoles;

// POST /api/trades - Create a new trade offer
router.post('/', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { receiverId, offeredPopId, requestedPopId, offeredQuantity, requestedQuantity, offeredCondition, requestedCondition } = req.body;

    if (!receiverId || !offeredPopId || !requestedPopId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify receiver exists and has the role 'vip' or 'admin'
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver user not found' });
    }

    if (receiver.role !== 'vip' && receiver.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'This user is not a VIP and cannot receive trades or messages'
      });
    }

    const targetOfferedQty = typeof offeredQuantity === 'number' && offeredQuantity > 0 
      ? offeredQuantity 
      : (parseInt(offeredQuantity, 10) > 0 ? parseInt(offeredQuantity, 10) : 1);

    const targetRequestedQty = typeof requestedQuantity === 'number' && requestedQuantity > 0 
      ? requestedQuantity 
      : (parseInt(requestedQuantity, 10) > 0 ? parseInt(requestedQuantity, 10) : 1);

    const trade = new TradeOffer({
      sender: req.user._id,
      receiver: receiverId,
      offeredItem: offeredPopId,
      requestedItem: requestedPopId,
      offeredQuantity: targetOfferedQty,
      requestedQuantity: targetRequestedQty,
      offeredCondition: offeredCondition || 'Mint (9.5-10)',
      requestedCondition: requestedCondition || 'Mint (9.5-10)',
      status: 'pending'
    });

    await trade.save();
    res.status(201).json(trade);
  } catch (error) {
    console.error('❌ Create Trade Offer Error:', error);
    res.status(500).json({ error: 'Failed to create trade offer' });
  }
});

// GET /api/trades/pending-count - Get count of pending incoming trades for current user
router.get('/pending-count', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const count = await TradeOffer.countDocuments({
      receiver: req.user._id,
      status: 'pending',
      hiddenBy: { $ne: req.user._id }
    });
    res.json({ pendingCount: count });
  } catch (error) {
    console.error('❌ Get Pending Trades Count Error:', error);
    res.status(500).json({ error: 'Failed to get pending trades count' });
  }
});

// GET /api/trades/incoming - Get incoming offers for the current user
router.get('/incoming', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const trades = await TradeOffer.find({ receiver: req.user._id, hiddenBy: { $ne: req.user._id } })
      .populate('sender', 'username email role')
      .populate('offeredItem')
      .populate('requestedItem');
    res.json(trades);
  } catch (error) {
    console.error('❌ Get Incoming Trades Error:', error);
    res.status(500).json({ error: 'Failed to get incoming trades' });
  }
});

// GET /api/trades/outgoing - Get outgoing offers sent by the current user
router.get('/outgoing', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const trades = await TradeOffer.find({ sender: req.user._id, hiddenBy: { $ne: req.user._id } })
      .populate('receiver', 'username email role')
      .populate('offeredItem')
      .populate('requestedItem');
    res.json(trades);
  } catch (error) {
    console.error('❌ Get Outgoing Trades Error:', error);
    res.status(500).json({ error: 'Failed to get outgoing trades' });
  }
});

// PUT /api/trades/hide-resolved - Mass hide resolved trades (non-pending)
router.put('/hide-resolved', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`🧹 [Clear History] Hiding resolved trades for user: ${userId}`);
    const result = await TradeOffer.updateMany(
      {
        $or: [
          { sender: userId },
          { receiver: userId }
        ],
        status: { $ne: 'pending' }
      },
      {
        $addToSet: { hiddenBy: userId }
      }
    );
    res.json({ message: 'Resolved history cleared successfully', matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('❌ Clear History Error:', error);
    res.status(500).json({ error: 'Failed to clear resolved history' });
  }
});

// PUT /api/trades/:id/hide - Soft delete/hide a single resolved trade
router.put('/:id/hide', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const trade = await TradeOffer.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade offer not found' });
    }

    // Verify user is either sender or receiver
    if (trade.sender.toString() !== req.user._id.toString() && trade.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to hide this trade' });
    }

    // Add req.user._id to hiddenBy set if not present
    if (!trade.hiddenBy.includes(req.user._id)) {
      trade.hiddenBy.push(req.user._id);
      await trade.save();
    }

    res.json({ message: 'Trade hidden successfully' });
  } catch (error) {
    console.error('❌ Hide Trade Error:', error);
    res.status(500).json({ error: 'Failed to hide trade' });
  }
});

// PUT /api/trades/:id/status - Accept, reject or cancel a trade offer
router.put('/:id/status', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected', 'canceled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status type. Must be accepted, rejected, or canceled.' });
    }

    const trade = await TradeOffer.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ error: 'Trade offer not found' });
    }

    if (status === 'canceled') {
      // Only the sender can cancel a pending trade
      if (trade.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only the trade sender can cancel the trade' });
      }
      if (trade.status !== 'pending') {
        return res.status(400).json({ error: 'Can only cancel pending trades' });
      }
    } else {
      // Only the receiver of the trade is allowed to update status (accept/reject)
      if (trade.receiver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Only the trade receiver can accept or reject the trade' });
      }
      if (trade.status !== 'pending') {
        return res.status(400).json({ error: 'Can only accept/reject pending trades' });
      }
    }

    const VaultItem = require('../models/VaultItem');

    if (status === 'accepted') {
      const sender = trade.sender;
      const receiver = trade.receiver;
      const offeredPop = trade.offeredItem; // PopCatalog ID
      const requestedPop = trade.requestedItem; // PopCatalog ID
      const offeredQty = typeof trade.offeredQuantity === 'number' && trade.offeredQuantity > 0 ? trade.offeredQuantity : 1;
      const requestedQty = typeof trade.requestedQuantity === 'number' && trade.requestedQuantity > 0 ? trade.requestedQuantity : 1;
      const offeredCond = trade.offeredCondition || 'Mint (9.5-10)';
      const requestedCond = trade.requestedCondition || 'Mint (9.5-10)';

      // 1. Find Sender's exact VaultItem matching pop & boxCondition
      let senderVaultItem = await VaultItem.findOne({ user: sender, pop: offeredPop, boxCondition: offeredCond });
      if (!senderVaultItem) {
        senderVaultItem = await VaultItem.findOne({ user: sender, pop: offeredPop });
      }

      // 2. Find Receiver's exact VaultItem matching pop & boxCondition
      let receiverVaultItem = await VaultItem.findOne({ user: receiver, pop: requestedPop, boxCondition: requestedCond });
      if (!receiverVaultItem) {
        receiverVaultItem = await VaultItem.findOne({ user: receiver, pop: requestedPop });
      }

      if (!senderVaultItem || !receiverVaultItem) {
        return res.status(400).json({ error: 'Trade invalid: Offered or requested items are no longer available in the respective vaults.' });
      }

      if (senderVaultItem.quantity < offeredQty) {
        return res.status(400).json({ error: `Trade invalid: Sender only has ${senderVaultItem.quantity} unit(s) available in ${senderVaultItem.boxCondition} condition.` });
      }

      if (receiverVaultItem.quantity < requestedQty) {
        return res.status(400).json({ error: `Trade invalid: Receiver only has ${receiverVaultItem.quantity} unit(s) available in ${receiverVaultItem.boxCondition} condition.` });
      }

      console.log(`🔄 [Trade Acceptance] Transferring ${offeredQty} unit(s) of Pop ${offeredPop} (${offeredCond}) from Sender ${sender} to Receiver ${receiver}`);

      // --- DECREMENT SENDER OFFERED ITEM ---
      senderVaultItem.quantity -= offeredQty;
      if (senderVaultItem.quantity <= 0) {
        await VaultItem.deleteOne({ _id: senderVaultItem._id });
      } else {
        await senderVaultItem.save();
      }

      // --- CREDIT RECEIVER OFFERED ITEM ---
      const receiverExistingOffered = await VaultItem.findOne({ user: receiver, pop: offeredPop, boxCondition: offeredCond });
      if (receiverExistingOffered) {
        receiverExistingOffered.quantity += offeredQty;
        await receiverExistingOffered.save();
      } else {
        await new VaultItem({
          user: receiver,
          pop: offeredPop,
          boxCondition: offeredCond,
          quantity: offeredQty
        }).save();
      }

      console.log(`🔄 [Trade Acceptance] Transferring ${requestedQty} unit(s) of Pop ${requestedPop} (${requestedCond}) from Receiver ${receiver} to Sender ${sender}`);

      // --- DECREMENT RECEIVER REQUESTED ITEM ---
      receiverVaultItem.quantity -= requestedQty;
      if (receiverVaultItem.quantity <= 0) {
        await VaultItem.deleteOne({ _id: receiverVaultItem._id });
      } else {
        await receiverVaultItem.save();
      }

      // --- CREDIT SENDER REQUESTED ITEM ---
      const senderExistingRequested = await VaultItem.findOne({ user: sender, pop: requestedPop, boxCondition: requestedCond });
      if (senderExistingRequested) {
        senderExistingRequested.quantity += requestedQty;
        await senderExistingRequested.save();
      } else {
        await new VaultItem({
          user: sender,
          pop: requestedPop,
          boxCondition: requestedCond,
          quantity: requestedQty
        }).save();
      }

      // Auto-cancel duplicate pending trade offers for the traded items
      console.log(`🗑️ [Trade Acceptance] Auto-cancelling duplicate pending trades for catalog items: ${offeredPop} & ${requestedPop}`);
      await TradeOffer.updateMany(
        {
          _id: { $ne: trade._id },
          status: 'pending',
          $or: [
            { sender: sender, offeredItem: offeredPop },
            { receiver: sender, requestedItem: offeredPop },
            { sender: receiver, offeredItem: requestedPop },
            { receiver: receiver, requestedItem: requestedPop }
          ]
        },
        { $set: { status: 'canceled' } }
      );
    }

    trade.status = status;
    await trade.save();
    res.json(trade);
  } catch (error) {
    console.error('❌ Update Trade Status Error:', error);
    res.status(500).json({ error: 'Failed to update trade status', message: error.message });
  }
});

module.exports = router;
