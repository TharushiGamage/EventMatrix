const Resource = require("../models/Resource");

// Create a new resource
const createResource = async (req, res) => {
  try {
    const {
      resourceName,
      resourceType,
      location,
      quantity,
      status,
      maintenanceStatus,
      description,
    } = req.body;

    if (!resourceName || !resourceType || !location || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Resource name, type, location, and quantity are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const existingResource = await Resource.findOne({
      resourceName: resourceName.trim(),
    });

    if (existingResource) {
      return res.status(400).json({
        success: false,
        message: "Resource name already exists",
      });
    }

    const resource = await Resource.create({
      resourceName,
      resourceType,
      location,
      quantity,
      status,
      maintenanceStatus,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create resource",
      error: error.message,
    });
  }
};

// Get all resources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get resources",
      error: error.message,
    });
  }
};

// Get one resource by id
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get resource",
      error: error.message,
    });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const {
      resourceName,
      resourceType,
      location,
      quantity,
      status,
      maintenanceStatus,
      description,
    } = req.body;

    if (quantity !== undefined && Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        resourceName,
        resourceType,
        location,
        quantity,
        status,
        maintenanceStatus,
        description,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update resource",
      error: error.message,
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete resource",
      error: error.message,
    });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
};