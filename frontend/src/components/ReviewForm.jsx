import React, { useState } from 'react';
import axios from 'axios';
import StarRating from './StarRating';

const ReviewForm = ({ noteId, onReviewSubmitted, existingReview = null, onCancel }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (existingReview) {
                // Update existing review
                await axios.put(`/notes/reviews/${existingReview._id}`, { rating, comment });
            } else {
                // Create new review
                await axios.post(`/notes/${noteId}/reviews`, { rating, comment });
            }

            onReviewSubmitted();
            setRating(0);
            setComment('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#2a2a2a]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {existingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>

            {/* Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Rating
                </label>
                <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Review
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your thoughts about this note..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
                    maxLength={1000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {comment.length}/1000 characters
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default ReviewForm;
