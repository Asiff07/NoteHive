const Stripe = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Note = require('../models/Note');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Payment Intent (Stripe)
exports.createStripeIntent = async (req, res) => {
    try {
        const { noteId } = req.body;
        const note = await Note.findById(noteId);

        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.owner.toString() === req.user.id) return res.status(400).json({ message: 'Cannot buy your own note' });

        const amount = Math.round(note.price * 100); // Stripe expects cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'inr',
            metadata: {
                noteId: note._id.toString(),
                buyerId: req.user.id,
                sellerId: note.owner.toString()
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { noteId } = req.body;
        const note = await Note.findById(noteId);

        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.owner.toString() === req.user.id) return res.status(400).json({ message: 'Cannot buy your own note' });

        const options = {
            amount: Math.round(note.price * 100), // paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                noteId: note._id.toString(),
                buyerId: req.user.id,
                sellerId: note.owner.toString()
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Stripe Checkout Session
exports.createStripeCheckout = async (req, res) => {
    try {
        const { noteId } = req.body;
        const note = await Note.findById(noteId).populate('owner');

        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.owner._id.toString() === req.user.id) return res.status(400).json({ message: 'Cannot buy your own note' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: note.subject,
                            description: note.textContent || 'University Note',
                        },
                        unit_amount: Math.round(note.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/?payment=cancelled`,
            metadata: {
                noteId: note._id.toString(),
                buyerId: req.user.id,
                sellerId: note.owner._id.toString(),
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { noteId } = req.body;
        const note = await Note.findById(noteId);

        if (!note) return res.status(404).json({ message: 'Note not found' });
        if (note.owner.toString() === req.user.id) return res.status(400).json({ message: 'Cannot buy your own note' });

        const options = {
            amount: Math.round(note.price * 100), // paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                noteId: note._id.toString(),
                buyerId: req.user.id,
                sellerId: note.owner.toString()
            }
        };

        const order = await razorpay.orders.create(options);
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature, noteId } = req.body;

        // Verify signature
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === signature) {
            // Payment is verified
            const note = await Note.findById(noteId);

            await handleSuccessfulPayment({
                noteId,
                buyerId: req.user.id,
                sellerId: note.owner.toString(),
                amount: note.price,
                provider: 'razorpay',
                providerPaymentId: paymentId,
                metadata: { orderId, paymentId, signature }
            });

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Stripe Webhook
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { noteId, buyerId, sellerId } = paymentIntent.metadata;

        await handleSuccessfulPayment({
            noteId,
            buyerId,
            sellerId,
            amount: paymentIntent.amount / 100,
            provider: 'stripe',
            providerPaymentId: paymentIntent.id,
            metadata: paymentIntent
        });
    }

    res.json({ received: true });
};

// Razorpay Webhook
exports.handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Add this to env
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body;
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const { noteId, buyerId, sellerId } = payment.notes;

            await handleSuccessfulPayment({
                noteId,
                buyerId,
                sellerId,
                amount: payment.amount / 100,
                provider: 'razorpay',
                providerPaymentId: payment.id,
                metadata: payment
            });
        }
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ message: 'Invalid signature' });
    }
};

// Common Payment Success Handler
const handleSuccessfulPayment = async ({ noteId, buyerId, sellerId, amount, provider, providerPaymentId, metadata }) => {
    try {
        // 1. Create Transaction
        await Transaction.create({
            note: noteId,
            buyer: buyerId,
            seller: sellerId,
            amount,
            provider,
            providerPaymentId,
            status: 'succeeded',
            metadata
        });

        // 2. Unlock Note for Buyer
        await Note.findByIdAndUpdate(noteId, {
            $addToSet: { purchasedBy: buyerId }
        });

        // 3. (Optional) Update Seller Balance or Trigger Payout
        // For now, we just record the transaction.

    } catch (error) {
        console.error('Payment handling error:', error);
    }
};
