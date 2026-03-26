const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole, updateUserStatus, unlockUser, getOrganizerEvents, getStudentRegistrations, deleteUser } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.put('/user-role', updateUserRole);
router.put('/user-status', updateUserStatus);
router.put('/unlock-user', unlockUser);
router.get('/organizer-events/:userId', getOrganizerEvents);
router.get('/student-registrations', getStudentRegistrations);
router.delete('/users/:userId', deleteUser);

module.exports = router;
