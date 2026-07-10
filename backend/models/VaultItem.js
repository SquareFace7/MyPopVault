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
    enum: ['Mint', 'Good', 'Damaged', 'Out of Box'],
    default: 'Mint'
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

// Enforce that a user cannot add the exact same Pop twice
VaultItemSchema.index({ user: 1, pop: 1 }, { unique: true });

module.exports = mongoose.model('VaultItem', VaultItemSchema);
