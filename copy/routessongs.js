// routes/songs.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Song = require('../models/Song');
const fs = require('fs');

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'audio') {
      cb(null, 'uploads/songs');
    } else if (file.fieldname === 'cover') {
      cb(null, 'uploads/covers');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Codigo para subir una canción
router.post('/upload', upload.fields([{ name: 'audio' }, { name: 'cover' }]), async (req, res) => {
  try {
    const { title, artist } = req.body;
    const audioFile = req.files['audio'][0];
    const coverFile = req.files['cover'][0];

    const newSong = new Song({
      title,
      artist,
      filename: audioFile.filename,
      cover: coverFile.filename
    });

    await newSong.save();
    res.status(201).json({ message: 'Canción subida correctamente', song: newSong });
  } catch (err) {
    res.status(500).json({ message: 'Error al subir la canción', error: err.message });
  }
});

// Obtener todas las canciones
router.get('/', async (req, res) => {
  const songs = await Song.find().sort({ createdAt: -1 });
  res.json(songs);
});

// Reproducir canción (stream)
router.get('/play/:filename', (req, res) => {
  const filepath = path.join(__dirname, '../uploads/songs', req.params.filename);
  res.sendFile(filepath);
});

// Obtener portada
router.get('/cover/:filename', (req, res) => {
  const filepath = path.join(__dirname, '../uploads/covers', req.params.filename);
  res.sendFile(filepath);
});

router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Canción no encontrada' });

    // Eliminar archivos del sistema
    fs.unlinkSync(`uploads/songs/${song.filename}`);
    fs.unlinkSync(`uploads/covers/${song.cover}`);

    // Eliminar de la base de datos
    await song.deleteOne();

    res.json({ message: 'Canción eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la canción', error: err.message });
  }
});

// Actualizar datos de la canción (título, artista, portada)
router.put('/:id', upload.fields([{ name: 'cover' }, { name: 'audio' }]), async (req, res) => {
  try {
    const { title, artist } = req.body;
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Canción no encontrada' });

    song.title = title || song.title;
    song.artist = artist || song.artist;

    const fs = require('fs');

    // Si hay nueva portada
    if (req.files['cover']) {
      fs.unlinkSync(`uploads/covers/${song.cover}`);
      song.cover = req.files['cover'][0].filename;
    }

    // Si hay nuevo audio
    if (req.files['audio']) {
      fs.unlinkSync(`uploads/songs/${song.filename}`);
      song.filename = req.files['audio'][0].filename;
    }

    await song.save();
    res.json({ message: 'Canción actualizada', song });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar', error: err.message });
  }
});



module.exports = router;
