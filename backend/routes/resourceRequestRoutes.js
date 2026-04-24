const express = require("express");

const {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
  updateResourceRequestStatus,
} = require("../controllers/resourceRequestController");

const router = express.Router();

router.post("/", createResourceRequest);
router.get("/", getResourceRequests);
router.get("/my-requests", getMyResourceRequests);
router.get("/:id", getResourceRequestById);
router.put("/:id/status", updateResourceRequestStatus);

module.exports = router;