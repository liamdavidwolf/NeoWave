const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  filename: String,
  cover: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);
