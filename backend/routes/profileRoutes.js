const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/profileUpload');
const {
	getUserProfile,
	updateUserProfile,
	sendPasswordOtp,
	changePassword,
	changePasswordDirect,
	uploadProfileImage,
} = require('../controllers/profileController');

router.use(protect);

router.get('/', getUserProfile);
router.put('/update', updateUserProfile);
router.post('/send-otp', sendPasswordOtp);
router.put('/change-password', changePassword);
router.put('/change-password-direct', changePasswordDirect);
router.post('/upload-image', profileUpload.single('profileImage'), uploadProfileImage);

module.exports = router;
