const mongoose = require("mongoose");

const resourceIssueSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource is required"],
    },

    reportedBy: {
      type: String,
      required: [true, "Reporter name is required"],
      trim: true,
    },

    issueType: {
      type: String,
      required: [true, "Issue type is required"],
      enum: [
        "Damage",
        "Missing Item",
        "Technical Issue",
        "Maintenance Required",
        "Other",
      ],
    },

    description: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
    },

    reportedDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Reported", "In Review", "Resolved"],
      default: "Reported",
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

module.exports = mongoose.model("ResourceIssue", resourceIssueSchema);