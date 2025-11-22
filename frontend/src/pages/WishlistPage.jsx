import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const { data } = await axios.get('/wishlist');
            setWishlist(data.wishlist);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (noteId) => {
        try {
            await axios.delete(`/wishlist/${noteId}`);
            setWishlist(wishlist.filter(note => note._id !== noteId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleView = (note) => {
        navigate(`/notes/${note._id}`);
    };

    const handleBuy = (note) => {
        // This will be handled by the note details page
        navigate(`/notes/${note._id}`);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Please log in to view your wishlist</h2>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] transition-colors duration-200">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="text-red-500" size={32} />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {wishlist.length} {wishlist.length === 1 ? 'note' : 'notes'} saved for later
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading wishlist...</p>
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map(note => (
                            <div key={note._id} className="relative">
                                <button
                                    onClick={() => handleRemove(note._id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <NoteCard note={note} onBuy={handleBuy} onView={handleView} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-[#1a1a1a] rounded-2xl">
                        <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start adding notes you're interested in!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            Browse Notes
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WishlistPage;
