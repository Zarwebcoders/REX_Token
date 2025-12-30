const express = require('express');
const router = express.Router();
const {
    getTransactions,
    createTransaction,
    updateTransactionStatus,
    getTransactionStats,
} = require('../controllers/transactionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get("/stats", protect, admin, getTransactionStats);
router.route('/')
    .get(protect, getTransactions)
    .post(protect, createTransaction);

router.route('/:id')
    .put(protect, admin, updateTransactionStatus);

module.exports = router;
