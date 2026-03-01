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

// Stats must come before :id to avoid matching "stats" as an ID
router.get('/stats', getStats);

// Check overlap must come before :id
router.get('/check-overlap', checkOverlap);

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', validateEvent, createEvent);
router.put('/:id', validateEvent, updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
