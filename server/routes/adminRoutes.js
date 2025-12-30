const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getReports,
    fixTotalInvestments,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/reports', protect, admin, getReports);
router.post('/fix-total-investments', protect, admin, fixTotalInvestments);

module.exports = router;
