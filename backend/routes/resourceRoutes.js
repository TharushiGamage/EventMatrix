const express = require("express");

const {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getResources);
router.get("/:id", getResourceById);

router.post("/", requireRole("Admin"), createResource);
router.put("/:id", requireRole("Admin"), updateResource);
router.delete("/:id", requireRole("Admin"), deleteResource);

module.exports = router;