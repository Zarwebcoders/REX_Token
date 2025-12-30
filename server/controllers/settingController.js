const Setting = require('../models/Setting');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (Some settings might be public) / Private usually
const getSettings = async (req, res) => {
    try {
        const settings = await Setting.find({});
        // Transform array to object for easier frontend consumption
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update settings (Admin)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    const updates = req.body; // Expect object { key: value, key2: value2 }

    try {
        const keys = Object.keys(updates);
        for (const key of keys) {
            await Setting.findOneAndUpdate(
                { key },
                { value: updates[key] },
                { upsert: true, new: true }
            );
        }
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
