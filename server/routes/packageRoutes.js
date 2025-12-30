const express = require('express');
const router = express.Router();
const {
    getPackages,
    createPackage,
    updatePackage,
} = require('../controllers/packageController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getPackages)
    .post(protect, admin, createPackage);

router.route('/:id')
    .put(protect, admin, updatePackage);

module.exports = router;
