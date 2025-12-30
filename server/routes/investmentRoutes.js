const express = require('express');
const router = express.Router();
const {
    createInvestment,
    getInvestments,
    getAllInvestments,
    updateInvestmentStatus
} = require('../controllers/investmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createInvestment)
    .get(protect, getInvestments);

// Admin routes
router.get('/all', protect, admin, getAllInvestments);
router.put('/:id', protect, admin, updateInvestmentStatus);

module.exports = router;
