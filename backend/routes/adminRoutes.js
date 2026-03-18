const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole, updateUserStatus, unlockUser } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.put('/user-role', updateUserRole);
router.put('/user-status', updateUserStatus);
router.put('/unlock-user', unlockUser);

module.exports = router;
