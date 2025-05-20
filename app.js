const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
// 2) Ubicación de los archivos .ejs
app.set('views', path.join(__dirname, 'views'));

// Middlewares para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(path.join(__dirname, 'uploads/songs'))); // Canciones
app.use('/covers', express.static(path.join(__dirname, 'public/covers'))); // Portadas de playlists
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads/covers'))); // Portadas de canciones

// 4) Conectar a MongoDB
mongoose.connect('mongodb+srv://root:root@neowave.ly4t8qq.mongodb.net/neowave?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar con MongoDB:', err));

// 5) Rutas de la API
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');

app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// 6) Rutas que renderizan vistas EJS
app.get('/',         (req, res) => res.render('index'));
app.get('/inicio',   (req, res) => res.render('inicio'));
app.get('/artistas', (req, res) => res.render('artistas'));
app.get('/login',    (req, res) => res.render('login'));
app.get('/planes',   (req, res) => res.render('planes'));
app.get('/playlist', (req, res) => res.render('playlist'));
app.get('/registro', (req, res) => res.render('registro'));
// Agrega más rutas de vistas según lo que necesites

// 7) Levantar servidor
app.listen(PORT, () => {
  console.log(`🎶 Servidor corriendo en http://localhost:${PORT}`);
});
