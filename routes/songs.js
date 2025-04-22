const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const songController = require('../controllers/songController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith('audio');
    cb(null, isAudio ? 'uploads/songs' : 'uploads/covers');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + '-' + file.fieldname + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

router.get('/', songController.getAllSongs);
router.get('/play/:filename', songController.streamSong);
router.get('/cover/:filename', songController.getCover);

router.post(
  '/upload',
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  songController.uploadSong
);

router.delete('/:id', songController.deleteSong);

router.put(
  '/:id',
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  songController.updateSong
);

module.exports = router;
