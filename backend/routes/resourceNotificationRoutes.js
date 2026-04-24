const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/resourceNotificationController");

const router = express.Router();

router.get("/", getNotifications);
router.put("/mark-all-read", markAllNotificationsAsRead);
router.put("/:id/read", markNotificationAsRead);

module.exports = router;