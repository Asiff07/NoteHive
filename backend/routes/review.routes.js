const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createReview,
    getNoteReviews,
    updateReview,
    deleteReview,
    markHelpful
} = require('../controllers/review.controller');

// Review routes
router.post('/:noteId/reviews', protect, createReview);
router.get('/:noteId/reviews', getNoteReviews);
router.put('/reviews/:reviewId', protect, updateReview);
router.delete('/reviews/:reviewId', protect, deleteReview);
router.post('/reviews/:reviewId/helpful', protect, markHelpful);

module.exports = router;
