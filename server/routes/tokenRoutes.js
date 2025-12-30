const express = require('express');
const router = express.Router();
const {
    updateTokenPrice,
    getTokenPrice,
    recoverTokens
} = require('../controllers/tokenController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/price', getTokenPrice);
router.post('/price', protect, admin, updateTokenPrice);
router.post('/recover', protect, admin, recoverTokens);

module.exports = router;
