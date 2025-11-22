const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    addToWishlist,
    removeFromWishlist,
    getWishlist
} = require('../controllers/wishlist.controller');

// Wishlist routes
router.post('/:noteId', protect, addToWishlist);
router.delete('/:noteId', protect, removeFromWishlist);
router.get('/', protect, getWishlist);

module.exports = router;
