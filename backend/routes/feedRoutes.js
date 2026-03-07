const express = require('express');
const router = express.Router();
const {
    getFeedEvents,
    getFeedEventDetail,
    getCalendarEvents,
    getEventImage,
} = require('../controllers/feedController');

router.get('/', getFeedEvents);
router.get('/calendar', getCalendarEvents);
router.get('/:id/image', getEventImage);
router.get('/:id', getFeedEventDetail);

module.exports = router;
