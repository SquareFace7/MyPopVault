const express = require('express');
const router = express.Router();
const PrivateMessage = require('../models/PrivateMessage');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = authMiddleware.authorizeRoles;

// GET /api/messages/private/unread-count - Get total unread count for current user
router.get('/private/unread-count', authMiddleware, authMiddleware.requireVerification, async (req, res) => {
  try {
    const myIdStr = req.user._id.toString();
    const count = await PrivateMessage.countDocuments({
      receiver: myIdStr,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('❌ Get Unread Count Error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// PUT /api/messages/private/read/:senderId - Mark all messages from senderId as read
router.put('/private/read/:senderId', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const myIdStr = req.user._id.toString();
    const { senderId } = req.params;

    const result = await PrivateMessage.updateMany(
      { sender: senderId.toString(), receiver: myIdStr, read: false },
      { $set: { read: true } }
    );

    console.log(`📝 Marked messages from ${senderId} to ${myIdStr} as read. Count: ${result.modifiedCount}`);

    // Emit updated unread count to sender room to keep clients synced
    const io = req.app.get('io');
    if (io) {
      const newCount = await PrivateMessage.countDocuments({
        receiver: myIdStr,
        read: false
      });
      io.to(myIdStr).emit('unreadCountUpdate', { unreadCount: newCount });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('❌ Mark Messages Read Error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// POST /api/messages/private - Send a private 1-on-1 message
router.post('/private', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ error: 'Receiver ID and message text are required' });
    }

    const senderId = req.user._id.toString();

    // Create and save private message
    const message = new PrivateMessage({
      sender: senderId,
      receiver: receiverId.toString(),
      text,
      read: false
    });

    console.log(`📝 [REST API] Saving private message from ${senderId} to ${receiverId}: "${text}"`);
    await message.save();
    console.log(`✅ [REST API] Saved successfully! ID: ${message._id}`);

    // Emit socket event to both sender and receiver rooms for real-time delivery
    const io = req.app.get('io');
    if (io) {
      console.log(`📤 [REST API Socket] Emitting privateMessage to receiver room: ${receiverId} and sender room: ${senderId}`);
      io.to(receiverId.toString()).to(senderId).emit('privateMessage', message);
      
      // Also emit updated unread count to receiver room
      const receiverUnread = await PrivateMessage.countDocuments({
        receiver: receiverId.toString(),
        read: false
      });
      io.to(receiverId.toString()).emit('unreadCountUpdate', { unreadCount: receiverUnread });
    } else {
      console.warn('⚠️ [REST API Socket] Socket.io instance not found on app settings.');
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('❌ Send Private Message Error:', error);
    res.status(500).json({ error: 'Failed to send private message', message: error.message });
  }
});

// GET /api/messages/private/conversations - Get all conversations for current user
router.get('/private/conversations', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const myIdStr = req.user._id.toString();
    
    // Find all private messages involving the current user (as String matching)
    const messages = await PrivateMessage.find({
      $or: [
        { sender: myIdStr },
        { receiver: myIdStr }
      ]
    })
    .sort({ timestamp: -1 });

    // Group messages by the "other" user
    const conversationsMap = new Map();
    const User = require('../models/User');

    for (const msg of messages) {
      const otherIdStr = msg.sender.toString() === myIdStr ? msg.receiver.toString() : msg.sender.toString();
      
      if (!otherIdStr) continue;

      // Since messages are sorted by timestamp descending, the first one we find for a user is the latest message!
      if (!conversationsMap.has(otherIdStr)) {
        let otherUser = null;
        try {
          const mongoose = require('mongoose');
          if (mongoose.Types.ObjectId.isValid(otherIdStr)) {
            otherUser = await User.findById(otherIdStr);
          } else {
            otherUser = await User.findOne({ username: otherIdStr });
          }
        } catch (e) {
          console.error('Error finding user:', e);
        }

        const username = otherUser?.username || otherIdStr;
        const role = otherUser?.role || 'vip';

        const unreadFromThisUser = await PrivateMessage.countDocuments({
          sender: otherIdStr,
          receiver: myIdStr,
          read: false
        });

        conversationsMap.set(otherIdStr, {
          otherUser: {
            _id: otherIdStr,
            username,
            role,
            avatar: username.substring(0, 2).toUpperCase()
          },
          latestMessage: msg.text,
          timestamp: msg.timestamp,
          unreadCount: unreadFromThisUser
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    console.error('❌ Get Conversations Error:', error);
    res.status(500).json({ error: 'Failed to retrieve active conversations' });
  }
});

// GET /api/messages/private/chat/:receiverId - Get message history between user and receiverId
router.get('/private/chat/:receiverId', authMiddleware, authMiddleware.requireVerification, authorizeRoles('vip', 'admin'), async (req, res) => {
  try {
    const myIdStr = req.user._id.toString();
    const { receiverId } = req.params;

    const messages = await PrivateMessage.find({
      $or: [
        { sender: myIdStr, receiver: receiverId.toString() },
        { sender: receiverId.toString(), receiver: myIdStr }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('❌ Get Private Chat Error:', error);
    res.status(500).json({ error: 'Failed to retrieve message logs' });
  }
});

module.exports = router;
