const User = require('../models/User');

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (User can update self, Admin can update anyone)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Check permissions: Admin or Self
            if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.user.role === 'admin') {
                user.role = req.body.role || user.role;
                user.status = req.body.status || user.status;
                user.kycStatus = req.body.kycStatus || user.kycStatus;
                user.balance = req.body.balance || user.balance;
            }

            // Allow user to update their wallet address (or admin)
            if (req.body.wallet) {
                user.wallet = req.body.wallet;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                kycStatus: updatedUser.kycStatus,
                wallet: updatedUser.wallet,
                balance: updatedUser.balance
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user downline
// @route   GET /api/users/downline
// @access  Private
const getDownline = async (req, res) => {
    try {
        // Use mongoose from require if not globally available, or import it
        const mongoose = require('mongoose');
        const downline = await User.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $graphLookup: {
                    from: "users",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "referredBy",
                    as: "network",
                    maxDepth: 4, // 0 is Level 1 (direct referals) relative to startWith? Wait, startWith is me.
                    // If startWith is ME, then level 0 in graphLookup is MY DIRECTS?
                    // Let's verify: connectToField 'referredBy' matches 'connectFromField' (_id).
                    // So users whose referredBy is ME are found.
                    depthField: "level"
                }
            }
        ]);

        if (!downline || downline.length === 0) {
            return res.json([]);
        }

        // graphLookup depth is 0 for first match.
        // So level 0 = Level 1 (Directs).
        // level 1 = Level 2.

        res.json(downline[0].network);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getDownline,
};
