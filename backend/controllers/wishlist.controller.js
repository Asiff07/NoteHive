const User = require('../models/User');
const Note = require('../models/Note');

// Add note to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Check if note exists
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Add to wishlist if not already there
        const user = await User.findById(userId);
        if (!user.wishlist.includes(noteId)) {
            user.wishlist.push(noteId);
            await user.save();
        }

        res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Remove note from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);
        user.wishlist = user.wishlist.filter(id => id.toString() !== noteId);
        await user.save();

        res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name email' }
        });

        res.json({ wishlist: user.wishlist || [] });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
