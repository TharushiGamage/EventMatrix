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
      'new_event',
      'new_user',
      'event_edit_request',
      'event_delete_request'
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
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ── Read status ──────────────────────────────────────────
  isRead: { type: Boolean, default: false }

}, { timestamps: true }); // createdAt = when the notification was sent

module.exports = mongoose.model('Notification', notificationSchema);
