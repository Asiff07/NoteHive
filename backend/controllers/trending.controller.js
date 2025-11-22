const Note = require('../models/Note');

// Get trending notes (last 7 days, sorted by views + downloads + rating)
exports.getTrendingNotes = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const notes = await Note.find({
            status: 'published',
            createdAt: { $gte: sevenDaysAgo }
        })
            .populate('owner', 'name email')
            .sort({ views: -1, downloads: -1, averageRating: -1 })
            .limit(parseInt(limit));

        res.json({ notes });
    } catch (error) {
        console.error('Get trending notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Increment view count
exports.incrementViews = async (req, res) => {
    try {
        const { noteId } = req.params;

        await Note.findByIdAndUpdate(noteId, { $inc: { views: 1 } });
        res.json({ message: 'View counted' });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get note preview
exports.getNotePreview = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await Note.findById(noteId).select('previewFile previewPages subject');
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (!note.previewFile) {
            return res.status(404).json({ message: 'Preview not available' });
        }

        res.json({
            previewFile: note.previewFile,
            previewPages: note.previewPages,
            subject: note.subject
        });
    } catch (error) {
        console.error('Get preview error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
