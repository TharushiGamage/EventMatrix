const ResourceNotification = require("../models/ResourceNotification");

const buildNotificationQuery = (req) => {
  const userRole = req.user?.role || req.headers["x-user-role"];
  const userName = req.user?.name || req.headers["x-user-name"] || "";

  if (!userRole) {
    return {};
  }

  if (userRole === "ResourceManager") {
    return {
      $or: [{ recipientRole: "ResourceManager" }, { recipientRole: "All" }],
    };
  }

  if (userRole === "Organizer") {
    return {
      $or: [
        {
          recipientRole: "Organizer",
          recipientName: { $in: [userName, "", null] },
        },
        { recipientRole: "All" },
      ],
    };
  }

  return {
    recipientRole: userRole,
  };
};

const getNotifications = async (req, res) => {
  try {
    const query = buildNotificationQuery(req);

    const notifications = await ResourceNotification.find(query)
      .populate("relatedResource")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.log("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications",
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
    console.log("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const query = buildNotificationQuery(req);

    await ResourceNotification.updateMany(query, {
      status: "Read",
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};