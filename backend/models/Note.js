const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        index: true
    },
    textContent: {
        type: String,
        index: true
    },
    taughtDate: {
        type: Date
    },
    images: [{
        type: String // Cloudinary URLs
    }],
    files: [{
        url: String,
        filename: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['official', 'market'],
        default: 'market'
    },
    price: {
        type: Number,
        default: 0
    },
    purchasedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'removed'],
        default: 'published'
    }
}, {
    timestamps: true
});

// Text index for search
noteSchema.index({ subject: 'text', textContent: 'text' });

module.exports = mongoose.model('Note', noteSchema);
