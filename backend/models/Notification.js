const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // ── Who receives this notification ───────────────────────
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Human-readable message ───────────────────────────────
  message: {
    type: String,
    required: true
  },

  // ── Notification category ────────────────────────────────
  type: {
    type: String,
    enum: [
      'registration_approved',
      'registration_rejected',
      'waitlist_available',
      'registration_cancelled',
      'registration_pending',
      'registration_request',
      'registration_confirmed',
      'new_registration',
      'new_event'
    ],
    required: true
  },

  // ── Optional links back to relevant documents ────────────
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  relatedRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    default: null
  },

  // ── Read status ──────────────────────────────────────────
  isRead: { type: Boolean, default: false }

}, { timestamps: true }); // createdAt = when the notification was sent

module.exports = mongoose.model('Notification', notificationSchema);
