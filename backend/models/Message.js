const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: [true, 'Sender name is required']
  },
  text: {
    type: String,
    required: [true, 'Message text is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
