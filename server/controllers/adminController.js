const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Package = require('../models/Package');
const KYC = require('../models/KYC');
const Investment = require('../models/Investment');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await User.countDocuments({ role: 'user', status: 'active' });

        const totalInvestment = await Transaction.aggregate([
            { $match: { type: 'investment', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalWithdrawals = await Transaction.aggregate([
            { $match: { type: 'withdrawal', status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const pendingKYC = await KYC.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            activeUsers,
            totalInvestment: totalInvestment[0]?.total || 0,
            totalWithdrawals: totalWithdrawals[0]?.total || 0,
            pendingKYC,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Analytics Reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Aggregate daily deposits and withdrawals for the last 7 days
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'completed',
                    type: { $in: ['deposit', 'withdrawal'] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    deposits: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "deposit"] }, "$amount", 0]
                        }
                    },
                    withdrawals: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "withdrawal"] }, "$amount", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format data for chart
        const revenueData = transactions.map(t => ({
            date: t._id,
            deposits: t.deposits,
            withdrawals: t.withdrawals,
            netRevenue: t.deposits - t.withdrawals
        }));

        res.json({
            revenueData,
            topCountries: [] // Placeholder as we don't track country yet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Recalculate all users' totalInvestment from approved investments
// @route   POST /api/admin/fix-total-investments
// @access  Private/Admin
const fixTotalInvestments = async (req, res) => {
    try {
        console.log('=== FIXING TOTAL INVESTMENTS ===');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let fixedCount = 0;
        const results = [];

        for (const user of users) {
            // Calculate correct total from approved/active investments
            const investments = await Investment.find({
                user: user._id,
                status: { $in: ['active', 'approved'] }
            });

            const correctTotal = investments.reduce((sum, inv) => sum + inv.amount, 0);
            const oldTotal = user.totalInvestment || 0;

            if (oldTotal !== correctTotal) {
                console.log(`User ${user.email}: ${oldTotal} -> ${correctTotal}`);
                user.totalInvestment = correctTotal;
                await user.save();
                fixedCount++;

                results.push({
                    email: user.email,
                    oldTotal,
                    correctTotal,
                    difference: correctTotal - oldTotal
                });
            }
        }

        console.log(`Fixed ${fixedCount} users`);
        console.log('=== DONE ===');

        res.json({
            success: true,
            message: `Fixed ${fixedCount} users' total investments`,
            results
        });

    } catch (error) {
        console.error('Error fixing total investments:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getReports,
    fixTotalInvestments,
};
