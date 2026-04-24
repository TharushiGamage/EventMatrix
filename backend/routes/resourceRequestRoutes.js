const express = require("express");

const {
  createResourceRequest,
  getResourceRequests,
  getResourceRequestById,
  getMyResourceRequests,
} = require("../controllers/resourceRequestController");

const router = express.Router();

router.post("/", createResourceRequest);
router.get("/", getResourceRequests);
router.get("/my-requests", getMyResourceRequests);
router.get("/:id", getResourceRequestById);

module.exports = router;