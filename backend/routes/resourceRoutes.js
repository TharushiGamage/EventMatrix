const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getResources,
  getResourceStats,
  getBookings,
  createResource,
  checkResourceAvailability,
  createResourceBooking,
} = require('../controllers/resourceController');

router.use(protect);

router.get('/', authorize('Organizer', 'Admin'), getResources);
router.get('/stats', authorize('Organizer', 'Admin'), getResourceStats);
router.get('/bookings', authorize('Organizer', 'Admin'), getBookings);
router.post('/check-availability', authorize('Organizer', 'Admin'), checkResourceAvailability);
router.post('/bookings', authorize('Organizer', 'Admin'), createResourceBooking);
router.post('/', authorize('Admin'), createResource);

module.exports = router;
