const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get all transactions (Admin: all, User: own)
// @route   GET /api/transactions
// @access  Private
const KYC = require('../models/KYC');

// @desc    Get all transactions (Admin: all, User: own)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        let transactions;
        if (req.user.role === 'admin') {
            transactions = await Transaction.find({})
                .populate('user', 'name email wallet')
                .populate('relatedUser', 'name')
                .sort({ createdAt: -1 })
                .lean();

            // Fetch KYC details for users to get bank info
            // Get unique user IDs from transactions
            const userIds = [...new Set(transactions.map(t => t.user?._id))];

            const kycRecords = await KYC.find({ user: { $in: userIds } }).lean();

            // Map KYC to user ID for easy lookup
            const kycMap = {};
            kycRecords.forEach(kyc => {
                if (kyc.user) kycMap[kyc.user.toString()] = kyc;
            });

            // Attach bank details to transactions
            transactions = transactions.map(t => {
                const kyc = kycMap[t.user?._id?.toString()];
                return {
                    ...t,
                    bankDetails: kyc?.bankDetails || null
                };
            });

        } else {
            transactions = await Transaction.find({ user: req.user.id })
                .populate('relatedUser', 'name')
                .sort({ createdAt: -1 });
        }
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    const { type, amount, crypto, hash, description } = req.body;

    try {
        const transaction = await Transaction.create({
            user: req.user.id,
            type,
            amount,
            crypto,
            hash,
            description,
        });

        // Update user balance if deposit completed (Simplify logic for demo)
        // In real world, this would be done via webhook or admin approval
        if (type === 'deposit' && transaction.status === 'completed') {
            // Logic to update balance
        }

        // Deduct balance for purchase immediately (simplified)
        if (type === 'purchase') {
            const user = await User.findById(req.user.id);
            if (user.balance >= amount) {
                user.balance -= amount;
                transaction.status = 'completed';
                await user.save();
                await transaction.save();
            } else {
                transaction.status = 'failed';
                transaction.description = 'Insufficient balance';
                await transaction.save();
                return res.status(400).json({ message: 'Insufficient balance' });
            }
        }

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update transaction status (Admin)
// @route   PUT /api/transactions/:id
// @access  Private/Admin
const updateTransactionStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const transaction = await Transaction.findById(req.params.id);

        if (transaction) {
            transaction.status = status;
            await transaction.save();

            // If approved/completed, update balance logic here
            // This is a simplified example
            if (status === 'completed') {
                const user = await User.findById(transaction.user);
                if (transaction.type === 'deposit') {
                    user.balance += transaction.amount;
                } else if (transaction.type === 'withdrawal') {
                    user.balance -= transaction.amount;
                }
                await user.save();
            }

            res.json(transaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    createTransaction,
    updateTransactionStatus,
    getTransactionStats,
};

// @desc    Get transaction statistics (Admin)
// @route   GET /api/transactions/stats
// @access  Private/Admin
const getTransactionStats = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get total count
        const totalCount = await Transaction.countDocuments();

        // Get total volume (sum of all completed transactions)
        const volumeResult = await Transaction.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalVolume = volumeResult.length > 0 ? volumeResult[0].total : 0;

        // Get pending count
        const pendingCount = await Transaction.countDocuments({ status: 'pending' });

        // Get failed count
        const failedCount = await Transaction.countDocuments({ status: 'failed' });

        // Get today's count
        const todayCount = await Transaction.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        res.json({
            totalTransactions: totalCount,
            totalVolume: totalVolume,
            pending: pendingCount,
            failed: failedCount,
            today: todayCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
