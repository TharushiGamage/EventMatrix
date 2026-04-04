const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, updateUserRole, updateUserStatus, unlockUser, getOrganizerEvents, getStudentRegistrations, deleteUser, requestEventEdit, requestEventDelete } = require('../controllers/adminController');

router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getUsers);
router.put('/user-role', updateUserRole);
router.put('/user-status', updateUserStatus);
router.put('/unlock-user', unlockUser);
router.get('/organizer-events/:userId', getOrganizerEvents);
router.get('/student-registrations', getStudentRegistrations);
router.delete('/users/:userId', deleteUser);
router.post('/events/:eventId/request-edit', requestEventEdit);
router.post('/events/:eventId/request-delete', requestEventDelete);

module.exports = router;
