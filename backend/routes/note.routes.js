const express = require('express');
const router = express.Router();
const { createNote, getNotes, getNoteById, deleteNote } = require('../controllers/note.controller');
const { getTrendingNotes, incrementViews, getNotePreview } = require('../controllers/trending.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.route('/')
    .get(protect, getNotes)
    .post(protect, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'docs', maxCount: 5 }]), createNote);

// Trending notes
router.get('/trending', getTrendingNotes);

router.route('/:id')
    .get(protect, getNoteById)
    .delete(protect, deleteNote);

// View tracking and preview
router.post('/:id/view', incrementViews);
router.get('/:id/preview', getNotePreview);

module.exports = router;
