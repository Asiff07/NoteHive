const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, updateUserRole } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
