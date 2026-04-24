const mongoose = require("mongoose");

const resourceNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["Request", "Approval", "Issue", "System"],
      default: "System",
    },

    recipientRole: {
      type: String,
      enum: ["Admin", "Organizer", "All"],
      default: "All",
    },

    recipientName: {
      type: String,
      trim: true,
      default: "",
    },

    relatedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null,
    },

    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceRequest",
      default: null,
    },

    relatedIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceIssue",
      default: null,
    },

    status: {
      type: String,
      enum: ["Unread", "Read"],
      default: "Unread",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ResourceNotification",
  resourceNotificationSchema
);