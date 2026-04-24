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

router.get("/", requireRole("ResourceManager", "Organizer"), getResources);
router.get("/:id", requireRole("ResourceManager", "Organizer"), getResourceById);

router.post("/", requireRole("ResourceManager"), createResource);
router.put("/:id", requireRole("ResourceManager"), updateResource);
router.delete("/:id", requireRole("ResourceManager"), deleteResource);

module.exports = router;