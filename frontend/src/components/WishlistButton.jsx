import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WishlistButton = ({ noteId, size = 20 }) => {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        checkWishlistStatus();
    }, [noteId, user]);

    const checkWishlistStatus = async () => {
        if (!user) return;

        try {
            const { data } = await axios.get('/wishlist');
            setIsInWishlist(data.wishlist.some(note => note._id === noteId));
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async (e) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            alert('Please login to add to wishlist');
            return;
        }

        setLoading(true);
        try {
            if (isInWishlist) {
                await axios.delete(`/wishlist/${noteId}`);
                setIsInWishlist(false);
            } else {
                await axios.post(`/wishlist/${noteId}`);
                setIsInWishlist(true);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            alert('Failed to update wishlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`p-2 rounded-full transition-all ${isInWishlist
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart
                size={size}
                className={`transition-all ${isInWishlist ? 'fill-current' : ''}`}
            />
        </button>
    );
};

export default WishlistButton;
