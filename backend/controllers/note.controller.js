const Note = require('../models/Note');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Helper to upload to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { folder: folder, resource_type: 'auto' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
};

exports.createNote = async (req, res) => {
    try {
        const { subject, textContent, type, price, taughtDate } = req.body;
        const files = req.files;

        // Validate price
        let validatedPrice = parseFloat(price) || 0;
        if (validatedPrice < 0) {
            return res.status(400).json({ message: 'Price cannot be negative' });
        }
        // If price is 0, it's free
        if (validatedPrice === 0 || type === 'official') {
            validatedPrice = 0;
        }

        let imageUrls = [];
        let fileUrls = [];

        if (files && files.images) {
            for (const file of files.images) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                let dataURI = "data:" + file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, { folder: 'notes_images' });
                imageUrls.push(result.secure_url);
            }
        }

        if (files && files.docs) {
            for (const file of files.docs) {
                const b64 = Buffer.from(file.buffer).toString('base64');
                let dataURI = "data:" + file.mimetype + ";base64," + b64;
                const result = await cloudinary.uploader.upload(dataURI, { folder: 'notes_docs', resource_type: 'auto' });
                fileUrls.push({ url: result.secure_url, filename: file.originalname });
            }
        }

        const note = await Note.create({
            subject,
            textContent,
            taughtDate,
            images: imageUrls,
            files: fileUrls,
            owner: req.user.id,
            type: type || 'market',
            price: validatedPrice,
            status: 'published'
        });

        res.status(201).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNotes = async (req, res) => {
    try {
        const { page = 1, limit = 20, subject, q, price, type } = req.query;
        const query = { status: 'published' };

        if (subject) query.subject = { $regex: subject, $options: 'i' };
        if (type) query.type = type;
        if (price === 'free') query.price = 0;
        if (price === 'paid') query.price = { $gt: 0 };

        if (req.query.dateFrom) {
            const from = new Date(req.query.dateFrom + 'T00:00:00');
            if (!isNaN(from)) {
                query.taughtDate = { ...(query.taughtDate || {}), $gte: from };
            }
        }
        if (req.query.dateTo) {
            const to = new Date(req.query.dateTo + 'T23:59:59');
            if (!isNaN(to)) {
                query.taughtDate = { ...(query.taughtDate || {}), $lte: to };
            }
        }

        if (q && q.trim() !== '') {
            query.$or = [
                { subject: { $regex: q, $options: 'i' } },
                { textContent: { $regex: q, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query)
            .populate('owner', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Note.countDocuments(query);

        res.json({
            notes,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate('owner', 'name');
        if (!note) return res.status(404).json({ message: 'Note not found' });

        // Check access
        const isOwner = note.owner._id.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isOfficial = note.type === 'official';
        const hasPurchased = note.purchasedBy.includes(req.user.id);

        if (isOwner || isAdmin || isOfficial || hasPurchased) {
            return res.json(note);
        }

        // If not purchased, return limited data
        const limitedNote = note.toObject();
        if (note.price > 0) {
            limitedNote.files = [];
            limitedNote.images = limitedNote.images.map(img => 'BLURRED_URL_OR_THUMBNAIL');
            limitedNote.textContent = note.textContent.substring(0, 100) + '... (Purchase to read more)';
        }

        res.json(limitedNote);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (note.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.incrementDownloadCount = async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { $inc: { downloads: 1 } },
            { new: true }
        );
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ downloads: note.downloads });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
