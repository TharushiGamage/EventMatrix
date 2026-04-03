const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const equipmentBookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const resourceBookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    venueResourceId: {
      type: String,
      default: null,
    },
    equipment: {
      type: [equipmentBookingSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resourceBookingSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ResourceBooking', resourceBookingSchema);
