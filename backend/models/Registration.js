const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // ── Who registered ───────────────────────────────────────
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ── Which event ──────────────────────────────────────────
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  // ── Form fields (filled by student at registration) ──────
  studentName:  { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentId:    { type: String, required: true },
  contactNo:    { type: String, required: true },
  faculty:      { type: String, default: '' },

  // ── Ticket info (for paid events) ────────────────────────
  ticketType:  { type: String, default: '' },   // name of the ticket tier chosen
  ticketPrice: { type: Number, default: 0 },

  // ── Registration status ──────────────────────────────────
  // confirmed  → non-paid event, instant confirmation
  // pending    → paid event, receipt uploaded, awaiting organizer review
  // approved   → organizer approved the payment
  // rejected   → organizer rejected the payment
  // cancelled  → student cancelled
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'approved', 'rejected', 'cancelled'],
    default: 'confirmed'
  },

  // ── Payment receipt (paid events only) ───────────────────
  receiptUrl:        { type: String, default: null },  // file path / URL of uploaded image
  receiptUploadedAt: { type: Date,   default: null },

  // ── Organizer review ─────────────────────────────────────
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:  { type: Date,   default: null },
  reviewNotes: { type: String, default: '' }

}, { timestamps: true });

// One active registration per student per event
registrationSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
