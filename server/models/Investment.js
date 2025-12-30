const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: false, // Optional - can invest without package
    },
    amount: {
        type: Number,
        required: true,
    },
    dailyReturn: {
        type: Number, // Percentage
        required: true,
    },
    dailyReturnAmount: {
        type: Number, // Actual amount
        required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'terminated', 'rejected'],
        default: 'pending', // Default to pending for manual verification
    },
    lastroiDate: {
        type: Date,
        default: Date.now,
    },
    transactionId: {
        type: String,
        required: true,
    },
    sponsorId: {
        type: String,
        default: "",
    },
    userWallet: {
        type: String,
        default: "0x0000000000000000000000000000000000000000",
        comment: "Investor's wallet address"
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Investment', investmentSchema);
