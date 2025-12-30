const Package = require('../models/Package');

// @desc    Get all active packages
// @route   GET /api/packages
// @access  Public
const getPackages = async (req, res) => {
    try {
        const packages = await Package.find({ status: 'active' });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new package (Admin)
// @route   POST /api/packages
// @access  Private/Admin
const createPackage = async (req, res) => {
    const { name, minInvestment, maxInvestment, dailyReturn, duration, description } = req.body;

    try {
        const pkg = await Package.create({
            name,
            minInvestment,
            maxInvestment,
            dailyReturn,
            duration,
            description,
        });
        res.status(201).json(pkg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update package (Admin)
// @route   PUT /api/packages/:id
// @access  Private/Admin
const updatePackage = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);

        if (pkg) {
            pkg.name = req.body.name || pkg.name;
            pkg.minInvestment = req.body.minInvestment || pkg.minInvestment;
            pkg.maxInvestment = req.body.maxInvestment || pkg.maxInvestment;
            pkg.dailyReturn = req.body.dailyReturn || pkg.dailyReturn;
            pkg.duration = req.body.duration || pkg.duration;
            pkg.status = req.body.status || pkg.status;
            pkg.description = req.body.description || pkg.description;

            const updatedPackage = await pkg.save();
            res.json(updatedPackage);
        } else {
            res.status(404).json({ message: 'Package not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPackages,
    createPackage,
    updatePackage,
};
