const Review = require('../models/Review');
const Note = require('../models/Note');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Check if note exists
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user has purchased the note
        const hasPurchased = note.purchasedBy.includes(userId) || note.price === 0;

        // Check if user already reviewed this note
        const existingReview = await Review.findOne({ note: noteId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this note' });
        }

        // Create review
        const review = await Review.create({
            note: noteId,
            user: userId,
            rating,
            comment,
            verifiedPurchase: hasPurchased
        });

        // Update note's average rating and total reviews
        await updateNoteRating(noteId);

        const populatedReview = await Review.findById(review._id).populate('user', 'name email');
        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all reviews for a note
exports.getNoteReviews = async (req, res) => {
    try {
        const { noteId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const reviews = await Review.find({ note: noteId })
            .populate('user', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments({ note: noteId });

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update own review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();

        // Update note's average rating
        await updateNoteRating(review.note);

        const populatedReview = await Review.findById(review._id).populate('user', 'name email');
        res.json(populatedReview);
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete own review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const noteId = review.note;
        await Review.findByIdAndDelete(reviewId);

        // Update note's average rating
        await updateNoteRating(noteId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Toggle helpful
        const index = review.helpful.indexOf(userId);
        if (index > -1) {
            review.helpful.splice(index, 1);
        } else {
            review.helpful.push(userId);
        }

        await review.save();
        res.json({ helpful: review.helpful.length, isHelpful: index === -1 });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to update note's average rating
const updateNoteRating = async (noteId) => {
    const reviews = await Review.find({ note: noteId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    await Note.findByIdAndUpdate(noteId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews
    });
};
