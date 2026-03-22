const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const receiptUpload = require('../middleware/receiptUpload');
const {
    registerForEvent,
    uploadReceipt,
    cancelRegistration,
    getMyRegistrations,
    getPendingRegistrations,
    reviewRegistration,
    getAttendance,
    getDashboardStats,
    getApprovedRegistrations,
} = require('../controllers/registrationController');

// ── Student routes ────────────────────────────────────────────────────────────

// Register for an event (Student only)
router.post('/', protect, authorize('Student'), registerForEvent);

// Upload payment receipt for a specific registration (Student only)
router.post(
    '/:id/upload-receipt',
    protect,
    authorize('Student'),
    receiptUpload.single('receipt'),
    uploadReceipt
);

// View own registrations (Student only)
router.get('/my', protect, authorize('Student'), getMyRegistrations);

// Cancel own registration (Student only)
router.delete('/:id', protect, authorize('Student'), cancelRegistration);

// ── Organizer routes ──────────────────────────────────────────────────────────

// Get aggregated stats for specific events
router.get('/dashboard-stats', protect, authorize('Organizer', 'Admin'), getDashboardStats);

// View all pending registrations (Organizer only)
// Optional query: ?eventId=<uuid>
router.get('/pending', protect, authorize('Organizer'), getPendingRegistrations);

// View all approved registrations (Organizer only)
router.get('/approved', protect, authorize('Organizer'), getApprovedRegistrations);

// Approve or reject a pending registration (Organizer only)
// Body: { action: 'approve' | 'reject', notes: '...' }
router.put('/:id/review', protect, authorize('Organizer'), reviewRegistration);

// ── Admin / Organizer routes ──────────────────────────────────────────────────

// Get attendance (confirmed + approved) for a specific event
router.get('/attendance/:eventId', protect, authorize('Organizer', 'Admin'), getAttendance);

module.exports = router;
