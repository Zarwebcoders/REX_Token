const Investment = require('../models/Investment');
const User = require('../models/User');
const Package = require('../models/Package');
const Transaction = require('../models/Transaction');

// @desc    Purchase a package (Create Investment)
// @route   POST /api/investments
// @access  Private
const createInvestment = async (req, res) => {
    const { packageId, amount, transactionId, sponsorId } = req.body;

    try {
        let pkg = null;
        let dailyReturn = 0;
        let duration = 365; // Default 1 year

        // If packageId is provided, fetch package details
        if (packageId) {
            pkg = await Package.findById(packageId);
            if (!pkg) {
                return res.status(404).json({ message: 'Package not found' });
            }

            // Validate amount against package limits
            if (amount < pkg.minInvestment || (pkg.maxInvestment !== 'Unlimited' && amount > pkg.maxInvestment)) {
                return res.status(400).json({ message: `Investment amount must be between ${pkg.minInvestment} and ${pkg.maxInvestment}` });
            }

            dailyReturn = pkg.dailyReturn;
            duration = pkg.duration;
        } else {
            // No package selected - use default ROI based on amount
            // Less than 1 lakh: 1% monthly = 0.033% daily
            // 1 lakh or more: 1.5% monthly = 0.05% daily
            const monthlyReturn = amount < 100000 ? 1 : 1.5;
            dailyReturn = monthlyReturn / 30; // Convert monthly to daily

            // Minimum investment check
            if (amount < 500) {
                return res.status(400).json({ message: 'Minimum investment amount is ₹500' });
            }
        }

        const user = await User.findById(req.user.id);

        // Investment request workflow:
        // 1. User pays to company bank account
        // 2. User submits investment request with payment proof
        // 3. Admin verifies payment and approves
        // 4. Investment becomes active

        // No balance deduction - this is a pending request
        // Admin will approve after verifying payment

        // Calculate end date based on duration (days)
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(duration));

        // Create Investment with PENDING status
        const investment = await Investment.create({
            user: req.user.id,
            package: pkg ? pkg._id : null, // Package is optional
            amount,
            dailyReturn: dailyReturn,
            dailyReturnAmount: (amount * dailyReturn) / 100,
            startDate,
            endDate,
            transactionId: transactionId || `INV${Date.now()}`,
            status: 'pending', // Pending admin approval
            sponsorId: sponsorId || ""
        });

        // Create Transaction Record with PENDING status
        await Transaction.create({
            user: req.user.id,
            type: 'investment',
            amount,
            description: pkg ? `Investment in ${pkg.name} package` : `Direct investment of ₹${amount}`,
            status: 'pending', // Pending verification
            hash: transactionId || `INV${Date.now()}`
        });

        res.status(201).json({
            success: true,
            message: 'Investment request submitted successfully! Your request will be processed within 24 hours after payment verification.',
            investment
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user investments
// @route   GET /api/investments
// @access  Private
const getInvestments = async (req, res) => {
    try {
        const investments = await Investment.find({ user: req.user.id })
            .populate('package', 'name duration dailyReturn')
            .sort({ createdAt: -1 });
        res.json(investments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all investments (Admin)
// @route   GET /api/investments/all
// @access  Private/Admin
const getAllInvestments = async (req, res) => {
    try {
        const investments = await Investment.find({})
            .populate('user', 'name email wallet')
            .populate('package', 'name duration dailyReturn')
            .sort({ createdAt: -1 });

        // Map 'active' status to 'approved' for frontend consistency
        const mappedInvestments = investments.map(inv => {
            const invObj = inv.toObject();
            if (invObj.status === 'active') {
                invObj.status = 'approved';
            }
            return invObj;
        });

        res.json(mappedInvestments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update investment status (Admin)
// @route   PUT /api/investments/:id
// @access  Private/Admin
const updateInvestmentStatus = async (req, res) => {
    let { status } = req.body;
    console.log('=== UPDATE INVESTMENT STATUS ===');
    console.log('Investment ID:', req.params.id);
    console.log('Requested status:', status);

    try {
        console.log('Step 1: Finding investment...');
        const investment = await Investment.findById(req.params.id);

        if (!investment) {
            console.log('Investment not found!');
            return res.status(404).json({ message: 'Investment not found' });
        }
        console.log('Investment found:', investment._id);

        const oldStatus = investment.status;
        console.log('Old status:', oldStatus);

        // Map 'approved' from frontend to 'active' in database
        const dbStatus = status === 'approved' ? 'active' : status;
        console.log('New DB status:', dbStatus);
        investment.status = dbStatus;

        // If approving the investment
        if (status === 'approved' && oldStatus === 'pending') {
            console.log('Step 2: Approving investment...');

            // Update the investment start date to now
            investment.startDate = new Date();
            console.log('Start date updated');

            // Recalculate end date
            console.log('Step 3: Calculating end date...');
            const duration = investment.package ?
                (await Package.findById(investment.package))?.duration || 365 : 365;
            console.log('Duration:', duration);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(duration));
            investment.endDate = endDate;
            console.log('End date:', endDate);

            // Update user's total investment (ONLY if transitioning from pending to approved)
            console.log('Step 4: Updating user total investment...');
            const user = await User.findById(investment.user);
            if (user) {
                console.log('User found:', user._id);
                console.log('Current total investment:', user.totalInvestment);
                console.log('Investment amount to add:', investment.amount);

                // IMPORTANT: Only add if this is the first approval
                // This prevents duplicate additions if someone clicks approve multiple times
                user.totalInvestment = (user.totalInvestment || 0) + investment.amount;
                console.log('New total investment:', user.totalInvestment);
                await user.save();
                console.log('User saved');

                // Step 4.5: Distribute level income to upline
                console.log('Step 4.5: Distributing level income to upline...');
                const levelPercentages = [5, 2, 1, 1, 1, 1, 7.5, 5, 2.5, 2.5];

                // Find upline users (up to 10 levels)
                let currentUser = user;
                for (let level = 0; level < 10; level++) {
                    if (!currentUser.referredBy) {
                        console.log(`No more upline at level ${level + 1}`);
                        break;
                    }

                    // Get the upline user
                    const uplineUser = await User.findById(currentUser.referredBy);
                    if (!uplineUser) {
                        console.log(`Upline user not found at level ${level + 1}`);
                        break;
                    }

                    // Calculate income for this level
                    const percentage = levelPercentages[level];
                    const incomeAmount = (investment.amount * percentage) / 100;

                    console.log(`Level ${level + 1}: User ${uplineUser.email} gets ${percentage}% = ₹${incomeAmount}`);

                    // Create income transaction
                    await Transaction.create({
                        user: uplineUser._id,
                        type: 'bonus',
                        amount: incomeAmount,
                        description: `Level ${level + 1} income from ${user.name}'s investment of ₹${investment.amount} (${percentage}%)`,
                        status: 'completed',
                        hash: `LEVEL${level + 1}-${investment._id}`
                    });

                    console.log(`Created level ${level + 1} income transaction for ${uplineUser.email}`);

                    // Move to next level
                    currentUser = uplineUser;
                }
                console.log('Level income distribution completed');
            }

            // Update related transaction status
            console.log('Step 5: Updating transaction status...');
            const txResult = await Transaction.updateOne(
                {
                    user: investment.user,
                    type: 'investment',
                    amount: investment.amount,
                    status: 'pending'
                },
                { status: 'completed' }
            );
            console.log('Transaction update result:', txResult);
        }

        // If rejecting the investment
        if (status === 'rejected') {
            console.log('Step 2: Rejecting investment...');
            // Update related transaction status
            await Transaction.updateOne(
                {
                    user: investment.user,
                    type: 'investment',
                    amount: investment.amount,
                    status: 'pending'
                },
                { status: 'failed' }
            );
        }

        console.log('Step 6: Saving investment...');
        await investment.save();
        console.log('Investment saved successfully');

        res.json({
            success: true,
            message: `Investment ${status} successfully`,
            investment
        });
        console.log('=== SUCCESS ===');

    } catch (error) {
        console.error('=== ERROR ===');
        console.error('Error updating investment status:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInvestment,
    getInvestments,
    getAllInvestments,
    updateInvestmentStatus,
};
