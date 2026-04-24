const ResourceIssue = require("../models/ResourceIssue");
const Resource = require("../models/Resource");
const ResourceNotification = require("../models/ResourceNotification");

const createNotification = async ({
  title,
  message,
  type,
  recipientRole,
  recipientName = "",
  relatedResource = null,
}) => {
  try {
    await ResourceNotification.create({
      title,
      message,
      type,
      recipientRole,
      recipientName,
      relatedResource,
      status: "Unread",
    });
  } catch (error) {
    console.log("Notification creation failed:", error.message);
  }
};

const createResourceIssue = async (req, res) => {
  try {
    const { resource, reportedBy, issueType, description } = req.body;

    if (!resource) {
      return res.status(400).json({
        success: false,
        message: "Resource is required",
      });
    }

    if (!reportedBy || !reportedBy.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reporter name is required",
      });
    }

    if (!issueType) {
      return res.status(400).json({
        success: false,
        message: "Issue type is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issue description is required",
      });
    }

    const selectedResource = await Resource.findById(resource);

    if (!selectedResource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const issue = await ResourceIssue.create({
      resource,
      reportedBy: reportedBy.trim(),
      issueType,
      description: description.trim(),
      status: "Reported",
      adminRemark: "",
    });

    await createNotification({
      title: "New Resource Issue Reported",
      message: `${reportedBy.trim()} reported a ${issueType} issue for ${selectedResource.resourceName}.`,
      type: "Issue",
      recipientRole: "ResourceManager",
      relatedResource: resource,
    });

    const populatedIssue = await ResourceIssue.findById(issue._id).populate(
      "resource"
    );

    return res.status(201).json({
      success: true,
      message: "Resource issue reported successfully",
      data: populatedIssue,
    });
  } catch (error) {
    console.log("Create resource issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report resource issue",
    });
  }
};

const getResourceIssues = async (req, res) => {
  try {
    const issues = await ResourceIssue.find()
      .populate("resource")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    console.log("Get resource issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load resource issues",
    });
  }
};

const getResourceIssueById = async (req, res) => {
  try {
    const issue = await ResourceIssue.findById(req.params.id).populate(
      "resource"
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Resource issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.log("Get resource issue by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load resource issue",
    });
  }
};

const updateResourceIssueStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    const allowedStatuses = ["Reported", "In Review", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue status",
      });
    }

    const issue = await ResourceIssue.findById(req.params.id).populate(
      "resource"
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Resource issue not found",
      });
    }

    issue.status = status;
    issue.adminRemark = adminRemark || issue.adminRemark || "";
    await issue.save();

    if (status === "In Review") {
      await Resource.findByIdAndUpdate(issue.resource._id, {
        status: "Unavailable",
        maintenanceStatus: "Under Maintenance",
      });

      await createNotification({
        title: "Resource Issue Under Review",
        message: `The reported issue for ${issue.resource.resourceName} is now under review. The resource is temporarily unavailable.`,
        type: "Issue",
        recipientRole: "Organizer",
        recipientName: issue.reportedBy,
        relatedResource: issue.resource._id,
      });
    }

    if (status === "Resolved") {
      await Resource.findByIdAndUpdate(issue.resource._id, {
        status: "Available",
        maintenanceStatus: "Good",
      });

      await createNotification({
        title: "Resource Issue Resolved",
        message: `The reported issue for ${issue.resource.resourceName} has been resolved. The resource is available again.`,
        type: "Issue",
        recipientRole: "Organizer",
        recipientName: issue.reportedBy,
        relatedResource: issue.resource._id,
      });
    }

    const updatedIssue = await ResourceIssue.findById(req.params.id).populate(
      "resource"
    );

    return res.status(200).json({
      success: true,
      message:
        status === "In Review"
          ? "Issue moved to review. Resource is now unavailable and under maintenance."
          : status === "Resolved"
          ? "Issue resolved successfully. Resource is available again."
          : "Issue status updated successfully.",
      data: updatedIssue,
    });
  } catch (error) {
    console.log("Update resource issue status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update resource issue status",
    });
  }
};

module.exports = {
  createResourceIssue,
  getResourceIssues,
  getResourceIssueById,
  updateResourceIssueStatus,
};