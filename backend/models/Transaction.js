const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'inr'
    },
    provider: {
        type: String,
        enum: ['stripe', 'razorpay'],
        required: true
    },
    providerPaymentId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    },
    metadata: {
        type: Object
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
