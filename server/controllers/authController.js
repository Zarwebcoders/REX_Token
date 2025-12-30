const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let sponsorId = null;
    let sponsorWalletAddress = '0x0000000000000000000000000000000000000000';

    if (referralCode) {
        // referralCode is the sponsor's wallet address (from referral link)
        const sponsor = await User.findOne({ wallet: referralCode });
        if (sponsor) {
            sponsorId = sponsor._id;
            // Save sponsor's wallet address directly
            sponsorWalletAddress = referralCode; // Use the wallet from ref parameter
        }
    }

    // Generate random referral code for new user
    const newReferralCode = name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    // Create user
    try {
        const user = await User.create({
            name,
            email,
            password,
            referralCode: newReferralCode,
            referredBy: sponsorId,
            sponsorWallet: sponsorWalletAddress // Save sponsor's wallet address (permanent)
            // wallet field will use default value from schema (user will connect later)
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                wallet: user.wallet,
                balance: user.balance
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            wallet: user.wallet,
            balance: user.balance
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user wallet address
// @route   PUT /api/auth/update-wallet
// @access  Private
const updateWallet = async (req, res) => {
    const { wallet } = req.body;

    console.log('📥 Received wallet update request');
    console.log('User ID:', req.user?.id);
    console.log('Wallet address from request:', wallet);

    if (!wallet) {
        console.error('❌ Validation failed: No wallet address provided');
        return res.status(400).json({ message: 'Wallet address is required' });
    }

    try {
        // Get current user data
        console.log('🔍 Fetching user data from database...');
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            console.error('❌ User not found in database:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ User found:', {
            id: currentUser._id,
            email: currentUser.email,
            currentWallet: currentUser.wallet
        });

        // Check if wallet is already set (not default zero address)
        if (currentUser.wallet && currentUser.wallet !== '0x0000000000000000000000000000000000000000') {
            console.log('⚠️ Wallet already connected for this user');
            console.log('Current wallet:', currentUser.wallet);
            console.log('Attempted new wallet:', wallet);
            return res.status(400).json({
                message: 'Wallet already connected. For security reasons, you cannot change your wallet address.',
                currentWallet: currentUser.wallet
            });
        }

        // Update wallet (first time only)
        console.log('💾 Updating wallet address in database...');
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { wallet },
            { new: true }
        );

        console.log('✅ Wallet address updated successfully');
        console.log('Updated user data:', {
            id: user._id,
            email: user.email,
            wallet: user.wallet
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            wallet: user.wallet,
            message: 'Wallet address connected successfully (permanent)'
        });
    } catch (error) {
        console.error('❌ Error in updateWallet function:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateWallet,
};
