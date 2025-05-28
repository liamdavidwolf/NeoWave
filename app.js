const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Configurar EJS como motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2) Configurar sesiones
app.use(session({
  secret: 'neowave_super_secret_key', // Cambia esto en producción
  resave: false,
  saveUninitialized: false,
}));

// Middleware para exponer la sesión en todas las vistas
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// 3) Middlewares para leer JSON y formularios    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4) Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(path.join(__dirname, 'uploads/songs')));
app.use('/covers', express.static(path.join(__dirname, 'public/covers')));
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads/covers')));

// 5) Conectar a MongoDB
mongoose.connect('mongodb+srv://root:root@neowave.ly4t8qq.mongodb.net/neowave?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error al conectar con MongoDB:', err));

// 6) Rutas de la API
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');

app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// 7) Rutas que renderizan vistas EJS
app.get('/',         (req, res) => res.render('index'));
app.get('/inicio',   (req, res) => res.render('inicio'));
app.get('/artistas', (req, res) => res.render('artistas'));
app.get('/login',    (req, res) => res.render('login'));
app.get('/planes',   (req, res) => res.render('planes'));
app.get('/playlist', (req, res) => res.render('playlist'));
app.get('/crearplaylist', (req, res) => res.render('crearplaylist'));
app.get('/playlistUsuarios', (req, res) => res.render('playlistUsuarios'));
app.get('/registro', (req, res) => res.render('registro'));

//PlaylistUsuarios
const playlistsUserRoutes = require('./routes/playlistsUser');
app.use('/', playlistsUserRoutes);


// 8) Rutas de usuario (Login, Registro, Logout)
const userRoutes = require('./routes/users');
app.use('/', userRoutes);

// 9) Levantar servidor
app.listen(PORT, () => {
  console.log(`🎶 Servidor corriendo en http://localhost:${PORT}`);
});
