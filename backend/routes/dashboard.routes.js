const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getDashboardStats,
    getSalesHistory,
    getSellerNotes
} = require('../controllers/dashboard.controller');

// Dashboard routes
router.get('/stats', protect, getDashboardStats);
router.get('/sales', protect, getSalesHistory);
router.get('/notes', protect, getSellerNotes);

module.exports = router;
