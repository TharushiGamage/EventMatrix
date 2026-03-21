const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
  // ── The student who tried to register but couldn't ───────
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── The event they wanted to attend ─────────────────────
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // ── Notification tracking ────────────────────────────────
  // Set to true once we send the "a slot is available" notification
  notified:   { type: Boolean, default: false },
  notifiedAt: { type: Date,    default: null }

}, { timestamps: true }); // createdAt = when the student was added to the waiting list

// One waiting-list entry per student per event
waitingListSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('WaitingList', waitingListSchema);
