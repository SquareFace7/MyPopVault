const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: [true, 'Sender name is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  text: {
    type: String,
    required: [true, 'Message text is required']
  },
  originalText: {
    type: String
  },
  isFlagged: {
    type: Boolean,
    default: false,
    index: true
  },
  flaggedReason: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
