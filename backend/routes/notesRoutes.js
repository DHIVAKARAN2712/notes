const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const {
  uploadNote, getNotes, getNoteById, deleteNote, restoreNote, getTrashedNotes,
  saveNote, getSavedNotes, addComment, downloadNote, getNotifications, markNotificationsRead
} = require('../controllers/notesController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg|zip/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('File type not allowed. Use PDF, DOC, DOCX, PPT, PPTX'));
  }
});

router.post('/upload',              auth, role('admin'), upload.single('file'), uploadNote);
router.get('/',                     auth, getNotes);
router.get('/saved',                auth, getSavedNotes);
router.get('/trash',                auth, role('admin'), getTrashedNotes);
router.get('/notifications',        auth, getNotifications);
router.patch('/notifications/read', auth, markNotificationsRead);
router.get('/:id',                  auth, getNoteById);
router.delete('/:id',               auth, deleteNote);
router.patch('/:id/restore',        auth, role('admin'), restoreNote);
router.get('/:id/download',         auth, downloadNote);
router.post('/save',                auth, saveNote);
router.post('/comment',             auth, addComment);

module.exports = router;
