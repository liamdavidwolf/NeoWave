const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Middleware para proteger rutas (revisar sesión)
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login');
}

// Mostrar la página con playlists del usuario y formulario para crear
router.get('/mis-playlists', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.session.userId });
    res.render('PlaylistUsuarios', { playlists });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar playlists');
  }
});

// Crear nueva playlist
router.post('/mis-playlists', isAuthenticated, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send('El nombre es obligatorio');
  }

  try {
    const newPlaylist = new Playlist({
      userId: req.session.userId,
      name,
      songs: []
    });
    await newPlaylist.save();
    res.redirect('/mis-playlists');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear playlist');
  }
});

module.exports = router;
