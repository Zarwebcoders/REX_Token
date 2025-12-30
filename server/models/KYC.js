const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One KYC per user
    },
    documentType: {
        type: String,
        default: 'Aadhar'
    },
    aadharNumber: { type: String },
    panNumber: { type: String },
    bankDetails: {
        accountName: String,
        bankName: String,
        accountNumber: String,
        branch: String,
        ifscCode: String
    },
    documents: {
        profilePhoto: String,
        aadharFront: String,
        aadharBack: String,
        panCard: String,
        agreement: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminNotes: {
        type: String,
    },
    submittedDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('KYC', kycSchema);
