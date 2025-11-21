const express = require('express');
const router = express.Router();
const { chatWithGemini } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, chatWithGemini);

module.exports = router;
