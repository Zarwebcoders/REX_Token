const KYC = require('../models/KYC');
const User = require('../models/User');

// @desc    Submit KYC
// @route   POST /api/kyc
// @access  Private
const submitKYC = async (req, res) => {
    const {
        aadharNumber, panNumber, bankDetails, documents
    } = req.body;

    try {
        const kycExists = await KYC.findOne({ user: req.user.id });

        if (kycExists) {
            return res.status(400).json({ message: 'KYC already submitted' });
        }

        const kyc = await KYC.create({
            user: req.user.id,
            aadharNumber,
            panNumber,
            bankDetails,
            documents,
        });

        // Update user status
        await User.findByIdAndUpdate(req.user.id, { kycStatus: 'pending' });

        res.status(201).json(kyc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending KYC (Admin)
// @route   GET /api/kyc/pending
// @access  Private/Admin
const getPendingKYC = async (req, res) => {
    try {
        const kycs = await KYC.find({ status: 'pending' }).populate('user', 'name email');
        res.json(kycs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user KYC
// @route   GET /api/kyc/me
// @access  Private
const getMyKYC = async (req, res) => {
    try {
        const kyc = await KYC.findOne({ user: req.user.id });
        if (!kyc) {
            return res.status(404).json({ message: 'KYC not found' });
        }
        res.json(kyc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update KYC status (Admin)
// @route   PUT /api/kyc/:id
// @access  Private/Admin
const updateKYCStatus = async (req, res) => {
    const { status, adminNotes } = req.body;

    try {
        const kyc = await KYC.findById(req.params.id);

        if (kyc) {
            kyc.status = status;
            kyc.adminNotes = adminNotes || kyc.adminNotes;
            await kyc.save();

            // Update user KYC status
            if (status === 'approved') {
                await User.findByIdAndUpdate(kyc.user, { kycStatus: 'verified' });
            } else if (status === 'rejected') {
                await User.findByIdAndUpdate(kyc.user, { kycStatus: 'rejected' });
            }

            res.json(kyc);
        } else {
            res.status(404).json({ message: 'KYC request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get KYC statistics (Admin)
// @route   GET /api/kyc/stats
// @access  Private/Admin
const getKYCStats = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get counts
        const pendingCount = await KYC.countDocuments({ status: 'pending' });
        const approvedTodayCount = await KYC.countDocuments({
            status: 'approved',
            updatedAt: { $gte: today, $lt: tomorrow }
        });
        const rejectedTodayCount = await KYC.countDocuments({
            status: 'rejected',
            updatedAt: { $gte: today, $lt: tomorrow }
        });
        const totalVerifiedCount = await KYC.countDocuments({ status: 'approved' });

        res.json({
            pendingReview: pendingCount,
            approvedToday: approvedTodayCount,
            rejectedToday: rejectedTodayCount,
            totalVerified: totalVerifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitKYC,
    getPendingKYC,
    getMyKYC,
    updateKYCStatus,
    getKYCStats,
};
