const express = require("express");

const {
  createResourceIssue,
  getResourceIssues,
  getResourceIssueById,
  updateResourceIssueStatus,
} = require("../controllers/resourceIssueController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", requireRole("Organizer", "Admin"), createResourceIssue);

router.get("/", requireRole("Admin"), getResourceIssues);
router.get("/:id", requireRole("Admin"), getResourceIssueById);
router.put("/:id/status", requireRole("Admin"), updateResourceIssueStatus);

module.exports = router;