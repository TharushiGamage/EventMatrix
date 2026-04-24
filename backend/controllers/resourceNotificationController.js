const ResourceNotification = require("../models/ResourceNotification");

const getNotifications = async (req, res) => {
  try {
    const { recipientName, recipientRole, type, status } = req.query;

    const filter = {};

    if (recipientName) {
      filter.recipientName = recipientName;
    }

    if (recipientRole) {
      filter.recipientRole = recipientRole;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const notifications = await ResourceNotification.find(filter)
      .populate("relatedResource", "resourceName resourceType location")
      .populate("relatedRequest", "eventName status requiredDate startTime endTime")
      .populate("relatedIssue", "issueType status description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await ResourceNotification.findByIdAndUpdate(
      req.params.id,
      { status: "Read" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await ResourceNotification.updateMany(
      { status: "Unread" },
      { status: "Read" }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};