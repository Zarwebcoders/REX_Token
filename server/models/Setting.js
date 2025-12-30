const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, or object
        required: true,
    },
    description: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Setting', settingSchema);
