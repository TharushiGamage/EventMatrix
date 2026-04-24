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

router.get("/", requireRole("Admin"), getResourceRequests);
router.get("/my-requests", requireRole("Organizer", "Admin"), getMyResourceRequests);
router.get("/:id", requireRole("Organizer", "Admin"), getResourceRequestById);

router.put("/:id/status", requireRole("Admin"), updateResourceRequestStatus);

module.exports = router;