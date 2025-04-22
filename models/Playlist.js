const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  cover: String, // URL o nombre del archivo de imagen
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);
