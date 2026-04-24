import { useEffect, useState } from "react";
import axios from "axios";

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editingResource, setEditingResource] = useState(null);

  const [editFormData, setEditFormData] = useState({
    resourceName: "",
    resourceType: "",
    location: "",
    quantity: "",
    status: "Available",
    maintenanceStatus: "Good",
    description: "",
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get("http://localhost:5000/api/v1/resources");
      setResources(response.data.data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load resources";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/v1/resources/${id}`);

      setMessage("Resource deleted successfully");
      setMessageType("success");
      fetchResources();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete resource";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleEditClick = (resource) => {
    setEditingResource(resource);

    setEditFormData({
      resourceName: resource.resourceName || "",
      resourceType: resource.resourceType || "",
      location: resource.location || "",
      quantity: resource.quantity || "",
      status: resource.status || "Available",
      maintenanceStatus: resource.maintenanceStatus || "Good",
      description: resource.description || "",
    });

    setMessage("");
    setMessageType("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    if (name === "maintenanceStatus" && value === "Under Maintenance") {
      setEditFormData({
        ...editFormData,
        maintenanceStatus: value,
        status: "Unavailable",
      });
      return;
    }

    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const validateEditForm = () => {
    if (!editFormData.resourceName.trim()) {
      return "Resource name is required";
    }

    if (!editFormData.resourceType) {
      return "Resource type is required";
    }

    if (!editFormData.location.trim()) {
      return "Location is required";
    }

    if (!editFormData.quantity || Number(editFormData.quantity) <= 0) {
      return "Quantity must be greater than 0";
    }

    if (
      editFormData.maintenanceStatus === "Under Maintenance" &&
      editFormData.status === "Available"
    ) {
      return "A resource under maintenance cannot be marked as Available";
    }

    return "";
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    if (!editingResource) {
      setMessage("No resource selected for update");
      setMessageType("error");
      return;
    }

    const validationError = validateEditForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/resources/${editingResource._id}`,
        {
          ...editFormData,
          quantity: Number(editFormData.quantity),
        }
      );

      setMessage(response.data.message || "Resource updated successfully");
      setMessageType("success");

      setEditingResource(null);
      fetchResources();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update resource";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Resource List</h1>
            <p className="subtitle">
              View, update, and manage university resources used for events,
              workshops, and club activities.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchResources}>
            Refresh
          </button>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {editingResource && (
          <div className="edit-section">
            <h2>Edit Resource</h2>
            <p className="subtitle">
              Update resource details, availability status, and maintenance
              status.
            </p>

            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>Resource Name</label>
                <input
                  type="text"
                  name="resourceName"
                  value={editFormData.resourceName}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Resource Type</label>
                <select
                  name="resourceType"
                  value={editFormData.resourceType}
                  onChange={handleEditChange}
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
                  value={editFormData.location}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity / Capacity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Availability Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Maintenance Status</label>
                <select
                  name="maintenanceStatus"
                  value={editFormData.maintenanceStatus}
                  onChange={handleEditChange}
                >
                  <option value="Good">Good</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="4"
                ></textarea>
              </div>

              <div className="button-row">
                <button type="submit" className="primary-button">
                  Update Resource
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading resources...</p>
        ) : resources.length === 0 ? (
          <p>No resources found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Maintenance</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {resources.map((resource) => (
                  <tr key={resource._id}>
                    <td>{resource.resourceName}</td>
                    <td>{resource.resourceType}</td>
                    <td>{resource.location}</td>
                    <td>{resource.quantity}</td>
                    <td>
                      <span
                        className={
                          resource.status === "Available"
                            ? "status available"
                            : "status unavailable"
                        }
                      >
                        {resource.status}
                      </span>
                    </td>
                    <td>{resource.maintenanceStatus}</td>
                    <td>{resource.description || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="secondary-button"
                          onClick={() => handleEditClick(resource)}
                        >
                          Edit
                        </button>

                        <button
                          className="danger-button"
                          onClick={() => handleDelete(resource._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceList;