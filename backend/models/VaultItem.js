const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  pop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PopCatalog',
    required: [true, 'Pop reference is required']
  },
  purchasePrice: {
    type: Number,
    default: 0
  },
  boxCondition: {
    type: String,
    default: 'Mint (9.5-10)'
  },
  quantity: {
    type: Number,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce uniqueness per user + pop + boxCondition combination
VaultItemSchema.index({ user: 1, pop: 1, boxCondition: 1 }, { unique: true });

module.exports = mongoose.model('VaultItem', VaultItemSchema);
