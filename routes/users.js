const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Ruta POST para procesar el login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).render('login', { error: 'Correo o contraseña incorrectos' });
    }

    // Guardar sesión
    req.session.userId = user._id;
    req.session.email = user.email;

    // Redirigir a inicio tras login
    res.redirect('/inicio');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { error: 'Error del servidor' });
  }
});

// Ruta GET para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.status(500).send('No se pudo cerrar sesión');
    }
    res.redirect('/login');
  });
});

// Registro de usuarios (mostrar formulario)
router.get('/registro', (req, res) => {
  res.render('registro');
});

// Procesar registro
router.post('/registro', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Validar si ya existe el usuario
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).render('registro', { error: 'Ya existe un usuario con ese correo.' });
    }

    // Crear nuevo usuario
    const newUser = new User({ email, username, password });
    await newUser.save();

    // Redirigir al login después del registro
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).render('registro', { error: 'Error al registrar el usuario.' });
  }
});

module.exports = router;
