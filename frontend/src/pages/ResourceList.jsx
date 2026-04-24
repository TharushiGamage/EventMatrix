import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

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

      const response = await api.get("/resources");
      setResources(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load resources");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const searchValue = `${resource.resourceName} ${resource.resourceType} ${resource.location}`
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchTerm || searchValue.includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "All" || resource.resourceType === typeFilter;

      const matchesStatus =
        statusFilter === "All" || resource.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [resources, searchTerm, typeFilter, statusFilter]);

  const countByStatus = (status) => {
    return resources.filter((resource) => resource.status === status).length;
  };

  const countByMaintenance = (maintenanceStatus) => {
    return resources.filter(
      (resource) => resource.maintenanceStatus === maintenanceStatus
    ).length;
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/resources/${id}`);
      setMessage("Resource deleted successfully");
      setMessageType("success");
      fetchResources();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete resource");
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
    if (!editFormData.resourceName.trim()) return "Resource name is required";
    if (!editFormData.resourceType) return "Resource type is required";
    if (!editFormData.location.trim()) return "Location is required";

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

    const validationError = validateEditForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      const response = await api.put(`/resources/${editingResource._id}`, {
        ...editFormData,
        quantity: Number(editFormData.quantity),
      });

      setMessage(response.data.message || "Resource updated successfully");
      setMessageType("success");
      setEditingResource(null);
      fetchResources();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update resource");
      setMessageType("error");
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Resource Manager Workspace</span>
          <h2>Resource List</h2>
          <p>
            View, search, update and remove venues, equipment and other
            university event resources from one centralized inventory.
          </p>
        </div>

        <div className="module-role-card">
          <span>Total Resources</span>
          <strong>{resources.length}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{resources.length}</h3>
          <p>Total Resources</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">02</span>
          <h3>{countByStatus("Available")}</h3>
          <p>Available</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{countByStatus("Unavailable")}</h3>
          <p>Unavailable</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{countByMaintenance("Under Maintenance")}</h3>
          <p>Under Maintenance</p>
        </div>
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>Inventory Records</h2>
            <p className="subtitle">
              Search and filter resources by type, status, location or name.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchResources}>
            Refresh
          </button>
        </div>

        <div className="module-filter-row">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Venue">Venue</option>
            <option value="Equipment">Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
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
              Update resource details, availability status and maintenance
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

              <div className="form-row">
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
                  <label>Quantity / Capacity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    min="1"
                  />
                </div>
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
                  onClick={() => setEditingResource(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading resources...</p>
        ) : filteredResources.length === 0 ? (
          <div className="empty-card">No matching resources found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
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
                {filteredResources.map((resource) => (
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
      </section>
    </div>
  );
}

export default ResourceList;