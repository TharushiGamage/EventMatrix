const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const resourceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      required: true,
      enum: ['venue', 'equipment'],
    },
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    capacity: {
      type: Number,
      default: null,
      min: 0,
    },
    totalUnits: {
      type: Number,
      default: 1,
      min: 0,
    },
    availableUnits: {
      type: Number,
      default: 1,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['available', 'reserved', 'maintenance'],
      default: 'available',
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Resource', resourceSchema);
