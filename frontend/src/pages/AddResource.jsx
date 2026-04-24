import { useState } from "react";
import axios from "axios";

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

    setFormData({
      ...formData,
      [name]: value,
    });
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
      return "Quantity must be greater than 0";
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
      const response = await axios.post("http://localhost:5000/api/v1/resources", {
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
    <div className="page-container">
      <div className="form-card">
        <h1>Add Resource</h1>
        <p className="subtitle">
          Add venues, equipment, furniture, or other resources required for
          university events.
        </p>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
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
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Example: Block A"
            />
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
              placeholder="Short description about the resource"
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="primary-button">
            Add Resource
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddResource;