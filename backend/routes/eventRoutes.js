const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getStats,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    checkOverlap,
} = require('../controllers/eventController');
const validateEvent = require('../middleware/validateEvent');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

// Stats must come before :id to avoid matching "stats" as an ID
router.get('/stats', getStats);

// Check overlap must come before :id
router.get('/check-overlap', checkOverlap);

// Public routes (browse events)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes - Organizer only (Organizers can create, edit, delete their own events)
router.post('/', protect, authorize('Organizer'), upload.single('image'), validateEvent, createEvent);
router.put('/:id', protect, authorize('Organizer'), upload.single('image'), validateEvent, updateEvent);
router.delete('/:id', protect, authorize('Organizer'), deleteEvent);

module.exports = router;

