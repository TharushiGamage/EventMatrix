const express = require("express");

const {
  createResourceIssue,
  getResourceIssues,
  getResourceIssueById,
  updateResourceIssueStatus,
} = require("../controllers/resourceIssueController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", requireRole("Organizer", "ResourceManager"), createResourceIssue);

router.get("/", requireRole("ResourceManager"), getResourceIssues);
router.get("/:id", requireRole("ResourceManager"), getResourceIssueById);
router.put("/:id/status", requireRole("ResourceManager"), updateResourceIssueStatus);

module.exports = router;