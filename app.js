const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para leer JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (CSS, JS, imágenes, HTML, etc.)
app.use(express.static('public'));

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/neowave', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch(err => {
  console.error('❌ Error al conectar con MongoDB:', err);
});

// Rutas
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');


app.use('/songs', express.static(path.join(__dirname, 'uploads/songs'))); // ruta canciones
app.use('/api/playlists', playlistRoutes);
app.use('/covers', express.static(path.join(__dirname, 'public/covers'))); //covers playlists
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads/covers'))); //cover canciones
app.use('/api/songs', songRoutes);



// Levantar servidor
app.listen(PORT, () => {
  console.log(`🎶 Servidor corriendo en http://localhost:${PORT}`);
});
