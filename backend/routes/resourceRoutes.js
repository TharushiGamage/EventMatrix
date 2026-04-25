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

router.get('/', authorize('Organizer', 'Admin', 'ResourceManager'), getResources);
router.get('/stats', authorize('Organizer', 'Admin', 'ResourceManager'), getResourceStats);
router.get('/bookings', authorize('Organizer', 'Admin', 'ResourceManager'), getBookings);
router.post('/check-availability', authorize('Organizer', 'Admin', 'ResourceManager'), checkResourceAvailability);
router.post('/bookings', authorize('Organizer', 'Admin', 'ResourceManager'), createResourceBooking);
router.post('/', authorize('Admin', 'ResourceManager'), createResource);

module.exports = router;
