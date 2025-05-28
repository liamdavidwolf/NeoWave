const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Configurar multer para guardar portadas
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/covers'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/playlists con portada
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const { name, songs, userId } = req.body; // 1. Destructure userId

    // 2. Add userId to validation check
    if (!name || !songs || !userId) {
      let errorMessage = 'Faltan datos en la solicitud: ';
      if (!name) errorMessage += 'nombre es requerido. ';
      if (!songs) errorMessage += 'canciones son requeridas. ';
      if (!userId) errorMessage += 'userId es requerido.';
      return res.status(400).json({ error: errorMessage.trim() });
    }

    const cover = req.file ? `/covers/${req.file.filename}` : null;
    const songsArray = Array.isArray(songs) ? songs : [songs];

    // 3. Include userId in new Playlist object
    const newPlaylist = new Playlist({ name, songs: songsArray, cover, userId });
    await newPlaylist.save();
    res.status(201).json({ message: 'Playlist guardada correctamente', playlist: newPlaylist });
  } catch (err) {
    console.error('❌ Error al guardar playlist:', err);
    res.status(500).json({ error: 'Error al guardar la playlist' });
  }
});

// GET /api/playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    res.json(playlists);
  } catch (err) {
    console.error('❌ Error al obtener playlists:', err);
    res.status(500).json({ error: 'Error al obtener playlists' });
  }
});

// PUT /api/playlists/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID inválido');
  }

  try {
    const updated = await Playlist.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('❌ Error al actualizar playlist:', err);
    res.status(500).json({ error: 'No se pudo actualizar la playlist' });
  }
});

// DELETE /api/playlists/:id
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist eliminada' });
  } catch (err) {
    console.error('❌ Error al eliminar playlist:', err);
    res.status(500).json({ error: 'No se pudo eliminar la playlist' });
  }
});

// GET /api/playlists/random/:count
router.get('/random/:num', async (req, res) => {
  const limit = parseInt(req.params.num) || 5;
  try {
    const randomPlaylists = await Playlist.aggregate([{ $sample: { size: limit } }]);

    // Cargar canciones con populate explícito
    const populated = await Promise.all(
      randomPlaylists.map(async (pl) => {
        return await Playlist.findById(pl._id).populate({
          path: 'songs',
          select: 'title artist filename cover' // <-- Aseguramos que estos campos estén
        });
      })
    );

    res.json(populated);
  } catch (err) {
    console.error('❌ Error al obtener playlists aleatorias:', err);
    res.status(500).json({ error: 'Error al obtener playlists aleatorias' });
  }
});



module.exports = router;
