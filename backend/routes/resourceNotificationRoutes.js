const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/resourceNotificationController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", requireRole("Admin", "Organizer"), getNotifications);
router.put("/mark-all-read", requireRole("Admin", "Organizer"), markAllNotificationsAsRead);
router.put("/:id/read", requireRole("Admin", "Organizer"), markNotificationAsRead);

module.exports = router;