const mongoose = require('mongoose');

const TradeOfferSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  offeredItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PopCatalog',
    required: true
  },
  requestedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PopCatalog',
    required: true
  },
  offeredQuantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'canceled'],
    default: 'pending'
  },
  hiddenBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TradeOffer', TradeOfferSchema);
