const Resource = require("../models/Resource");
const ResourceRequest = require("../models/ResourceRequest");

const createResourceRequest = async (req, res) => {
  try {
    const {
      eventName,
      resource,
      organizerName,
      requiredDate,
      startTime,
      endTime,
      quantity,
      purpose,
    } = req.body;

    if (
      !eventName ||
      !resource ||
      !organizerName ||
      !requiredDate ||
      !startTime ||
      !endTime ||
      !quantity ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Event name, resource, organizer name, date, start time, end time, quantity, and purpose are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    const selectedDate = new Date(requiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Required date must be today or a future date",
      });
    }

    const selectedResource = await Resource.findById(resource);

    if (!selectedResource) {
      return res.status(404).json({
        success: false,
        message: "Selected resource not found",
      });
    }

    if (selectedResource.status !== "Available") {
      return res.status(400).json({
        success: false,
        message: "Selected resource is currently unavailable",
      });
    }

    if (selectedResource.maintenanceStatus === "Under Maintenance") {
      return res.status(400).json({
        success: false,
        message: "Selected resource is under maintenance",
      });
    }

    if (Number(quantity) > selectedResource.quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is greater than available quantity",
      });
    }

    const dayStart = new Date(requiredDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(requiredDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBooking = await ResourceRequest.findOne({
      resource,
      requiredDate: {
        $gte: dayStart,
        $lte: dayEnd,
      },
      status: {
        $in: ["Pending", "Approved"],
      },
      startTime: {
        $lt: endTime,
      },
      endTime: {
        $gt: startTime,
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "This resource is already requested or booked for the selected date and time",
      });
    }

    const resourceRequest = await ResourceRequest.create({
      eventName,
      resource,
      organizerName,
      requiredDate,
      startTime,
      endTime,
      quantity,
      purpose,
      status: "Pending",
    });

    const populatedRequest = await ResourceRequest.findById(
      resourceRequest._id
    ).populate("resource", "resourceName resourceType location quantity");

    return res.status(201).json({
      success: true,
      message: "Resource request created successfully",
      data: populatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create resource request",
      error: error.message,
    });
  }
};

const getResourceRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find()
      .populate("resource", "resourceName resourceType location quantity")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get resource requests",
      error: error.message,
    });
  }
};

const getResourceRequestById = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id).populate(
      "resource",
      "resourceName resourceType location quantity"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Resource request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get resource request",
      error: error.message,
    });
  }
};

const getMyResourceRequests = async (req, res) => {
  try {
    const { organizerName } = req.query;

    if (!organizerName) {
      return res.status(400).json({
        success: false,
        message: "Organizer name is required as a query parameter",
      });
    }

    const requests = await ResourceRequest.find({ organizerName })
      .populate("resource", "resourceName resourceType location quantity")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get organizer resource requests",
      error: error.message,
    });
  }
};

module.exports = {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
};