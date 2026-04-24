const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true,
      unique: true,
    },

    resourceType: {
      type: String,
      required: [true, "Resource type is required"],
      enum: ["Venue", "Equipment", "Furniture", "Other"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be greater than 0"],
    },

    status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },

    maintenanceStatus: {
      type: String,
      enum: ["Good", "Under Maintenance"],
      default: "Good",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);