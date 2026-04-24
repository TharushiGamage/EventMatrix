const express = require("express");

const {
  createResourceIssue,
  getResourceIssues,
  getResourceIssueById,
  updateResourceIssueStatus,
} = require("../controllers/resourceIssueController");

const router = express.Router();

router.post("/", createResourceIssue);
router.get("/", getResourceIssues);
router.get("/:id", getResourceIssueById);
router.put("/:id/status", updateResourceIssueStatus);

module.exports = router;