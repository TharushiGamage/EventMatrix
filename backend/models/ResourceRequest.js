const mongoose = require("mongoose");

const resourceRequestSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource is required"],
    },

    organizerName: {
      type: String,
      required: [true, "Organizer name is required"],
      trim: true,
    },

    requiredDate: {
      type: Date,
      required: [true, "Required date is required"],
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be greater than 0"],
    },

    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },

    adminRemark: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ResourceRequest", resourceRequestSchema);