import { useEffect, useState } from "react";
import axios from "axios";

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

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
      fetchResources();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete resource";
      setMessage(errorMessage);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Resource List</h1>
            <p className="subtitle">
              View and manage university resources used for events, workshops,
              and club activities.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchResources}>
            Refresh
          </button>
        </div>

        {message && <div className="info-box">{message}</div>}

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
                  <th>Action</th>
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
                    <td>
                      <button
                        className="danger-button"
                        onClick={() => handleDelete(resource._id)}
                      >
                        Delete
                      </button>
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