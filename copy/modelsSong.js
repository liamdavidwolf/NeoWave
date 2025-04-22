// models/Song.js
const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: String,
  artist: String,
  filename: String, // nombre del archivo de la canción
  cover: String,     // nombre del archivo de portada
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Song', SongSchema);
