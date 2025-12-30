const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    minInvestment: {
        type: Number,
        required: true,
    },
    maxInvestment: {
        type: Number, // Use a very large number for 'Unlimited'
        required: true,
    },
    dailyReturn: {
        type: Number, // Percentage value, e.g., 2.5
        required: true,
    },
    duration: {
        type: Number, // In days
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    description: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Package', packageSchema);
