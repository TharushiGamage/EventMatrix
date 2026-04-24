const express = require("express");

const {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
  updateResourceRequestStatus,
} = require("../controllers/resourceRequestController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", requireRole("Organizer"), createResourceRequest);

router.get("/", requireRole("ResourceManager", "Organizer"), getResourceRequests);
router.get(
  "/my-requests",
  requireRole("Organizer", "ResourceManager"),
  getMyResourceRequests
);
router.get("/:id", requireRole("Organizer", "ResourceManager"), getResourceRequestById);

router.put(
  "/:id/status",
  requireRole("ResourceManager"),
  updateResourceRequestStatus
);

module.exports = router;