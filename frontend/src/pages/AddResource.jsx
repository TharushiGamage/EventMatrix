import { useState } from "react";
import api from "../utils/api";

function AddResource() {
  const [formData, setFormData] = useState({
    resourceName: "",
    resourceType: "",
    location: "",
    quantity: "",
    status: "Available",
    maintenanceStatus: "Good",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "maintenanceStatus" && value === "Under Maintenance") {
      setFormData({
        ...formData,
        maintenanceStatus: value,
        status: "Unavailable",
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    if (!formData.resourceName.trim()) {
      return "Resource name is required";
    }

    if (!formData.resourceType) {
      return "Resource type is required";
    }

    if (!formData.location.trim()) {
      return "Location is required";
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      return "Quantity or capacity must be greater than 0";
    }

    if (
      formData.maintenanceStatus === "Under Maintenance" &&
      formData.status === "Available"
    ) {
      return "A resource under maintenance cannot be marked as Available";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      const response = await api.post("/resources", {
        ...formData,
        quantity: Number(formData.quantity),
      });

      setMessage(response.data.message || "Resource added successfully");
      setMessageType("success");

      setFormData({
        resourceName: "",
        resourceType: "",
        location: "",
        quantity: "",
        status: "Available",
        maintenanceStatus: "Good",
        description: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add resource";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="resource-add-page">
      <section className="add-resource-hero">
        <div>
          <span className="dashboard-kicker">Resource Manager Workspace</span>
          <h2>Add New Resource</h2>
          <p>
            Create and maintain university venues, equipment, furniture, and
            other resources required for events, workshops, and club activities.
          </p>
        </div>

        <div className="add-resource-role-card">
          <span>Access Level</span>
          <strong>Resource Manager</strong>
        </div>
      </section>

      <section className="add-resource-layout">
        <div className="add-resource-info-card">
          <h3>Resource Creation Rules</h3>

          <div className="rule-item">
            <strong>01</strong>
            <p>Resource name, type, location, and quantity are required.</p>
          </div>

          <div className="rule-item">
            <strong>02</strong>
            <p>Quantity or capacity must be greater than zero.</p>
          </div>

          <div className="rule-item">
            <strong>03</strong>
            <p>
              If maintenance status is Under Maintenance, the resource becomes
              Unavailable.
            </p>
          </div>

          <div className="rule-item">
            <strong>04</strong>
            <p>
              Added resources will appear in Resource List and Availability
              views.
            </p>
          </div>
        </div>

        <div className="add-resource-form-card">
          <div className="form-heading">
            <h3>Resource Details</h3>
            <p>Fill in the details below to add a new resource.</p>
          </div>

          {message && (
            <div
              className={
                messageType === "success" ? "success-box" : "error-box"
              }
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Resource Name</label>
              <input
                type="text"
                name="resourceName"
                value={formData.resourceName}
                onChange={handleChange}
                placeholder="Example: Main Auditorium"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Resource Type</label>
                <select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleChange}
                >
                  <option value="">Select resource type</option>
                  <option value="Venue">Venue</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantity / Capacity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Example: 1"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Block A - Main Hall"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Availability Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="form-group">
                <label>Maintenance Status</label>
                <select
                  name="maintenanceStatus"
                  value={formData.maintenanceStatus}
                  onChange={handleChange}
                >
                  <option value="Good">Good</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about this resource"
                rows="4"
              ></textarea>
            </div>

            <button type="submit" className="primary-button">
              Add Resource
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AddResource;