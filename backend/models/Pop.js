const mongoose = require('mongoose');

const PopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pop name is required'],
    trim: true
  },
  series: {
    type: String,
    required: [true, 'Series category is required'],
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  releaseYear: {
    type: Number
  },
  isVaulted: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pop', PopSchema);
