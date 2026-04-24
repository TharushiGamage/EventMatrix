const Resource = require("../models/Resource");
const ResourceRequest = require("../models/ResourceRequest");
const ResourceNotification = require("../models/ResourceNotification");

const findAlternativeResources = async ({
  resource,
  requiredDate,
  startTime,
  endTime,
  quantity,
}) => {
  const dayStart = new Date(requiredDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(requiredDate);
  dayEnd.setHours(23, 59, 59, 999);

  const conflictingBookings = await ResourceRequest.find({
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
  }).select("resource");

  const blockedResourceIds = conflictingBookings.map((booking) =>
    booking.resource.toString()
  );

  if (resource) {
    blockedResourceIds.push(resource.toString());
  }

  const alternativeResources = await Resource.find({
    _id: {
      $nin: blockedResourceIds,
    },
    status: "Available",
    maintenanceStatus: "Good",
    quantity: {
      $gte: Number(quantity),
    },
  })
    .select("resourceName resourceType location quantity status maintenanceStatus")
    .limit(5);

  return alternativeResources;
};

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
      const alternativeResources = await findAlternativeResources({
        resource,
        requiredDate,
        startTime,
        endTime,
        quantity,
      });

      return res.status(400).json({
        success: false,
        message:
          "Selected resource is currently unavailable. Please choose an alternative resource.",
        alternativeResources,
      });
    }

    if (selectedResource.maintenanceStatus === "Under Maintenance") {
      const alternativeResources = await findAlternativeResources({
        resource,
        requiredDate,
        startTime,
        endTime,
        quantity,
      });

      return res.status(400).json({
        success: false,
        message:
          "Selected resource is under maintenance. Please choose an alternative resource.",
        alternativeResources,
      });
    }

    if (Number(quantity) > selectedResource.quantity) {
      const alternativeResources = await findAlternativeResources({
        resource,
        requiredDate,
        startTime,
        endTime,
        quantity,
      });

      return res.status(400).json({
        success: false,
        message:
          "Requested quantity is greater than available quantity. Please choose an alternative resource.",
        alternativeResources,
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
      const alternativeResources = await findAlternativeResources({
        resource,
        requiredDate,
        startTime,
        endTime,
        quantity,
      });

      return res.status(400).json({
        success: false,
        message:
          "This resource is already requested or booked for the selected date and time. Alternative resources are suggested below.",
        alternativeResources,
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

    await ResourceNotification.create({
      title: "Resource Request Submitted",
      message: `${organizerName} requested ${selectedResource.resourceName} for ${eventName}. The request is waiting for admin approval.`,
      type: "Request",
      recipientRole: "Admin",
      recipientName: "Admin",
      relatedResource: selectedResource._id,
      relatedRequest: resourceRequest._id,
    });

    await ResourceNotification.create({
      title: "Request Confirmation",
      message: `Your request for ${selectedResource.resourceName} has been submitted successfully and is currently Pending.`,
      type: "Request",
      recipientRole: "Organizer",
      recipientName: organizerName,
      relatedResource: selectedResource._id,
      relatedRequest: resourceRequest._id,
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

const updateResourceRequestStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Approved or Rejected",
      });
    }

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

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved or rejected",
      });
    }

    if (status === "Approved") {
      const dayStart = new Date(request.requiredDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(request.requiredDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingApprovedBooking = await ResourceRequest.findOne({
        _id: { $ne: request._id },
        resource: request.resource._id,
        requiredDate: {
          $gte: dayStart,
          $lte: dayEnd,
        },
        status: "Approved",
        startTime: {
          $lt: request.endTime,
        },
        endTime: {
          $gt: request.startTime,
        },
      });

      if (existingApprovedBooking) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot approve because this resource is already approved for an overlapping time slot",
        });
      }
    }

    request.status = status;
    request.adminRemark = adminRemark || "";

    const updatedRequest = await request.save();

    await ResourceNotification.create({
      title:
        status === "Approved"
          ? "Resource Request Approved"
          : "Resource Request Rejected",
      message:
        status === "Approved"
          ? `Your request for ${request.resource.resourceName} for ${request.eventName} has been approved.`
          : `Your request for ${request.resource.resourceName} for ${request.eventName} has been rejected. Remark: ${
              adminRemark || "No remark provided"
            }`,
      type: "Approval",
      recipientRole: "Organizer",
      recipientName: request.organizerName,
      relatedResource: request.resource._id,
      relatedRequest: request._id,
    });

    const populatedRequest = await ResourceRequest.findById(
      updatedRequest._id
    ).populate("resource", "resourceName resourceType location quantity");

    return res.status(200).json({
      success: true,
      message: `Resource request ${status.toLowerCase()} successfully`,
      data: populatedRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update resource request status",
      error: error.message,
    });
  }
};

module.exports = {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
  updateResourceRequestStatus,
};