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

// Compound index for user + pop + boxCondition
VaultItemSchema.index({ user: 1, pop: 1, boxCondition: 1 }, { unique: true });

const VaultItem = mongoose.model('VaultItem', VaultItemSchema);

// Helper function to safely drop obsolete user_1_pop_1 index from production DB
async function dropObsoleteIndex() {
  try {
    const indexes = await VaultItem.collection.indexes();
    const hasLegacyIndex = indexes.some(idx => idx.name === 'user_1_pop_1');
    if (hasLegacyIndex) {
      await VaultItem.collection.dropIndex('user_1_pop_1');
      console.log('✅ Obsolete VaultItem index user_1_pop_1 dropped successfully.');
    }
  } catch (e) {
    // Ignore if collection or index doesn't exist yet
  }
}

if (mongoose.connection.readyState === 1) {
  dropObsoleteIndex();
} else {
  mongoose.connection.once('open', dropObsoleteIndex);
}

module.exports = VaultItem;
