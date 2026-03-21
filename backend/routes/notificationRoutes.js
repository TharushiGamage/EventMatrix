const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');

// All notification routes require authentication (any role)

// Fetch my notifications — optional query: ?unreadOnly=true
router.get('/', protect, getMyNotifications);

// Mark all my notifications as read
router.put('/read-all', protect, markAllAsRead);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
