import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';

const ReviewSection = ({ noteId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchReviews();
    }, [noteId]);

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`/notes/${noteId}/reviews`);
            setReviews(data.reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmitted = () => {
        setShowForm(false);
        setEditingReview(null);
        fetchReviews();
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await axios.delete(`/notes/reviews/${reviewId}`);
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            await axios.post(`/notes/reviews/${reviewId}/helpful`);
            fetchReviews();
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const userReview = reviews.find(r => r.user._id === user?._id);
    const canReview = user && !userReview;

    if (loading) {
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reviews ({reviews.length})
                </h2>
                {canReview && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {(showForm || editingReview) && (
                <ReviewForm
                    noteId={noteId}
                    existingReview={editingReview}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingReview(null);
                    }}
                />
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 border border-gray-200 dark:border-[#2a2a2a]"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {review.user.name}
                                        </h4>
                                        {review.verifiedPurchase && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                                <ShieldCheck size={14} />
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <StarRating rating={review.rating} readonly />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {user?._id === review.user._id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingReview(review)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
                            <button
                                onClick={() => handleHelpful(review._id)}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${review.helpful.includes(user?._id)
                                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                        : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'
                                    }`}
                            >
                                <ThumbsUp size={16} />
                                Helpful ({review.helpful.length})
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
