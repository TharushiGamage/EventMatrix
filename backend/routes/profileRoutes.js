const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, changePassword } = require('../controllers/profileController');

router.use(protect);

router.get('/', getUserProfile);
router.put('/update', updateUserProfile);
router.put('/change-password', changePassword);

module.exports = router;
