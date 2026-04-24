const Resource = require("../models/Resource");
const ResourceIssue = require("../models/ResourceIssue");
const ResourceNotification = require("../models/ResourceNotification");

const createResourceIssue = async (req, res) => {
  try {
    const { resource, reportedBy, issueType, description } = req.body;

    if (!resource || !reportedBy || !issueType || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Resource, reporter name, issue type, and description are required",
      });
    }

    const selectedResource = await Resource.findById(resource);

    if (!selectedResource) {
      return res.status(404).json({
        success: false,
        message: "Selected resource not found",
      });
    }

    const issue = await ResourceIssue.create({
      resource,
      reportedBy,
      issueType,
      description,
      status: "Reported",
    });

    selectedResource.maintenanceStatus = "Under Maintenance";
    selectedResource.status = "Unavailable";
    await selectedResource.save();

    await ResourceNotification.create({
      title: "Resource Issue Reported",
      message: `${reportedBy} reported a ${issueType} for ${selectedResource.resourceName}. The resource is now marked as Unavailable and Under Maintenance.`,
      type: "Issue",
      recipientRole: "Admin",
      recipientName: "Admin",
      relatedResource: selectedResource._id,
      relatedIssue: issue._id,
    });

    await ResourceNotification.create({
      title: "Issue Report Confirmation",
      message: `Your issue report for ${selectedResource.resourceName} has been submitted successfully.`,
      type: "Issue",
      recipientRole: "Organizer",
      recipientName: reportedBy,
      relatedResource: selectedResource._id,
      relatedIssue: issue._id,
    });

    const populatedIssue = await ResourceIssue.findById(issue._id).populate(
      "resource",
      "resourceName resourceType location status maintenanceStatus"
    );

    return res.status(201).json({
      success: true,
      message:
        "Resource issue reported successfully and resource marked as unavailable and under maintenance",
      data: populatedIssue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to report resource issue",
      error: error.message,
    });
  }
};

const getResourceIssues = async (req, res) => {
  try {
    const issues = await ResourceIssue.find()
      .populate(
        "resource",
        "resourceName resourceType location status maintenanceStatus"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get resource issues",
      error: error.message,
    });
  }
};

const getResourceIssueById = async (req, res) => {
  try {
    const issue = await ResourceIssue.findById(req.params.id).populate(
      "resource",
      "resourceName resourceType location status maintenanceStatus"
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
    return res.status(500).json({
      success: false,
      message: "Failed to get resource issue",
      error: error.message,
    });
  }
};

const updateResourceIssueStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!["Reported", "In Review", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Reported, In Review, or Resolved",
      });
    }

    const issue = await ResourceIssue.findById(req.params.id).populate(
      "resource",
      "resourceName resourceType location status maintenanceStatus"
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Resource issue not found",
      });
    }

    issue.status = status;
    issue.adminRemark = adminRemark || "";

    const updatedIssue = await issue.save();

    if (status === "Resolved") {
      const resource = await Resource.findById(issue.resource._id);

      if (resource) {
        resource.maintenanceStatus = "Good";
        resource.status = "Available";
        await resource.save();
      }

      await ResourceNotification.create({
        title: "Resource Issue Resolved",
        message: `The issue reported for ${issue.resource.resourceName} has been resolved. The resource is now Available and Good.`,
        type: "Issue",
        recipientRole: "All",
        recipientName: "",
        relatedResource: issue.resource._id,
        relatedIssue: issue._id,
      });
    }

    if (status === "In Review") {
      await ResourceNotification.create({
        title: "Resource Issue In Review",
        message: `The issue reported for ${issue.resource.resourceName} is now being reviewed by admin.`,
        type: "Issue",
        recipientRole: "Admin",
        recipientName: "Admin",
        relatedResource: issue.resource._id,
        relatedIssue: issue._id,
      });
    }

    const populatedIssue = await ResourceIssue.findById(
      updatedIssue._id
    ).populate(
      "resource",
      "resourceName resourceType location status maintenanceStatus"
    );

    return res.status(200).json({
      success: true,
      message: "Resource issue status updated successfully",
      data: populatedIssue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update resource issue status",
      error: error.message,
    });
  }
};

module.exports = {
  createResourceIssue,
  getResourceIssues,
  getResourceIssueById,
  updateResourceIssueStatus,
};