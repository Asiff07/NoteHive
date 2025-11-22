const Note = require('../models/Note');
const Transaction = require('../models/Transaction');

// Get seller dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Total notes
        const totalNotes = await Note.countDocuments({ owner: sellerId, status: 'published' });

        // Total sales
        const transactions = await Transaction.find({ seller: sellerId, status: 'succeeded' });
        const totalSales = transactions.length;
        const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Total views
        const notes = await Note.find({ owner: sellerId });
        const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
        const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);

        // Average rating
        const notesWithRatings = notes.filter(note => note.totalReviews > 0);
        const averageRating = notesWithRatings.length > 0
            ? notesWithRatings.reduce((sum, note) => sum + note.averageRating, 0) / notesWithRatings.length
            : 0;

        res.json({
            totalNotes,
            totalSales,
            totalRevenue,
            totalViews,
            totalDownloads,
            averageRating: Math.round(averageRating * 10) / 10
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get sales history
exports.getSalesHistory = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const sales = await Transaction.find({ seller: sellerId, status: 'succeeded' })
            .populate('note', 'subject price')
            .populate('buyer', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments({ seller: sellerId, status: 'succeeded' });

        res.json({
            sales,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get sales history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get seller's notes with analytics
exports.getSellerNotes = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const notes = await Note.find({ owner: sellerId })
            .select('subject price averageRating totalReviews views downloads purchasedBy createdAt status')
            .sort({ createdAt: -1 });

        // Add sales count to each note
        const notesWithStats = notes.map(note => ({
            ...note.toObject(),
            salesCount: note.purchasedBy.length
        }));

        res.json({ notes: notesWithStats });
    } catch (error) {
        console.error('Get seller notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
