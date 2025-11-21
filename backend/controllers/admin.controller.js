const User = require('../models/User');
const Note = require('../models/Note');
const Transaction = require('../models/Transaction');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalNotes = await Note.countDocuments();
        const totalSales = await Transaction.aggregate([
            { $match: { status: 'succeeded' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyer', 'name email')
            .populate('note', 'subject price');

        res.json({
            totalUsers,
            totalNotes,
            totalRevenue: totalSales[0]?.total || 0,
            recentTransactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
