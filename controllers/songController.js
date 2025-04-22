const Song = require('../models/Song');
const fs = require('fs');
const path = require('path');

exports.getAllSongs = async (req, res) => {
  const songs = await Song.find().sort({ _id: -1 });
  res.json(songs);
};

exports.uploadSong = async (req, res) => {
  try {
    const { title, artist } = req.body;
    const audio = req.files['audio'][0];
    const cover = req.files['cover'][0];

    const song = new Song({
      title,
      artist,
      filename: audio.filename,
      cover: cover.filename,
    });

    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ error: 'Error al subir canción' });
  }
};

exports.streamSong = (req, res) => {
  const filepath = path.join(__dirname, '../uploads/songs', req.params.filename);
  res.sendFile(filepath);
};

exports.getCover = (req, res) => {
  const filepath = path.join(__dirname, '../uploads/covers', req.params.filename);
  res.sendFile(filepath);
};

exports.deleteSong = async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ error: 'No encontrada' });

  fs.unlinkSync(path.join(__dirname, '../uploads/songs', song.filename));
  fs.unlinkSync(path.join(__dirname, '../uploads/covers', song.cover));

  await Song.findByIdAndDelete(req.params.id);
  res.json({ message: 'Canción eliminada' });
};

exports.updateSong = async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).json({ error: 'No encontrada' });

  const { title, artist } = req.body;

  if (title) song.title = title;
  if (artist) song.artist = artist;

  if (req.files['cover']) {
    fs.unlinkSync(path.join(__dirname, '../uploads/covers', song.cover));
    song.cover = req.files['cover'][0].filename;
  }

  if (req.files['audio']) {
    fs.unlinkSync(path.join(__dirname, '../uploads/songs', song.filename));
    song.filename = req.files['audio'][0].filename;
  }

  await song.save();
  res.json(song);
};
