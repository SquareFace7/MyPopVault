const mongoose = require('mongoose');

const PopCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  series: {
    type: String,
    required: true
  },
  itemNumber: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  marketPrice: {
    type: Number,
    required: true,
    default: 15
  }
});

module.exports = mongoose.model('PopCatalog', PopCatalogSchema);
