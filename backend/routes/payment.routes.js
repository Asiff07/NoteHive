const express = require('express');
const router = express.Router();
const { createStripeIntent, createRazorpayOrder, handleStripeWebhook, handleRazorpayWebhook, createStripeCheckout, verifyRazorpayPayment, verifyStripeCheckout } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Stripe routes
router.post('/stripe/create-checkout', protect, createStripeCheckout);
router.post('/stripe/verify-checkout', protect, verifyStripeCheckout);
router.post('/create-intent', protect, createStripeIntent);

// Razorpay routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/create-razorpay-order', protect, createRazorpayOrder);

// Webhooks (Must use raw body parser in server.js for Stripe)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.post('/webhook/razorpay', handleRazorpayWebhook);

module.exports = router;
