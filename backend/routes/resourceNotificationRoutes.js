const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/resourceNotificationController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", requireRole("ResourceManager", "Organizer"), getNotifications);
router.put(
  "/mark-all-read",
  requireRole("ResourceManager", "Organizer"),
  markAllNotificationsAsRead
);
router.put(
  "/:id/read",
  requireRole("ResourceManager", "Organizer"),
  markNotificationAsRead
);

module.exports = router;