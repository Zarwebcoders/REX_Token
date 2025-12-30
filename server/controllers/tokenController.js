const Setting = require('../models/Setting');
const User = require('../models/User');

// @desc    Update token price and phase
// @route   POST /api/token/price
// @access  Private/Admin
const updateTokenPrice = async (req, res) => {
    const { price, phase } = req.body;

    try {
        if (price !== undefined) {
            await Setting.findOneAndUpdate(
                { key: 'rexTokenPrice' },
                { value: price },
                { upsert: true, new: true }
            );
        }

        if (phase !== undefined) {
            await Setting.findOneAndUpdate(
                { key: 'currentPhase' },
                { value: phase },
                { upsert: true, new: true }
            );
        }

        res.json({ message: 'Token price and phase updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current token price and phase
// @route   GET /api/token/price
// @access  Public
const getTokenPrice = async (req, res) => {
    try {
        const priceSetting = await Setting.findOne({ key: 'rexTokenPrice' });
        const phaseSetting = await Setting.findOne({ key: 'currentPhase' });

        res.json({
            price: priceSetting ? priceSetting.value : 0.1, // Default price
            phase: phaseSetting ? phaseSetting.value : 'Phase 1'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Recover tokens from user account (Deduct amount)
// @route   POST /api/token/recover
// @access  Private/Admin
const recoverTokens = async (req, res) => {
    const { wallet, amount } = req.body;

    try {
        // Find user by wallet or email (reuse wallet field for flexibility if needed, but primarily wallet)
        const user = await User.findOne({
            $or: [
                { wallet: wallet },
                { email: wallet } // Allow email as fallback identifier
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const amountToRecover = parseFloat(amount);

        if (isNaN(amountToRecover) || amountToRecover <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (user.rexToken < amountToRecover) {
            return res.status(400).json({ message: 'Insufficient token balance' });
        }

        // Deduct tokens
        user.rexToken -= amountToRecover;

        // Log action (Optional: could create a transaction record here)
        // For now just save user
        await user.save();

        res.json({
            message: `Successfully recovered ${amountToRecover} REX tokens from ${user.name}`,
            remainingBalance: user.rexToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateTokenPrice,
    getTokenPrice,
    recoverTokens
};
