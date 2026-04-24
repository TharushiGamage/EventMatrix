import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function ReserveResource() {
  const loggedUser = JSON.parse(localStorage.getItem("resourceUser"));

  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    eventName: "",
    resource: "",
    organizerName: loggedUser?.name || "Organizer",
    requiredDate: "",
    startTime: "",
    endTime: "",
    quantity: 1,
    purpose: "",
  });

  const [selectedResource, setSelectedResource] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [alternatives, setAlternatives] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const resourcesResponse = await api.get("/resources");
      const requestsResponse = await api.get("/resource-requests");

      setResources(resourcesResponse.data.data || []);

      const allRequests = requestsResponse.data.data || [];
      const organizerRequests = allRequests.filter(
        (request) =>
          request.organizerName === formData.organizerName ||
          request.organizerName === loggedUser?.name
      );

      setRequests(organizerRequests);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load organizer data");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableResources = useMemo(() => {
    return resources.filter(
      (resource) =>
        resource.status === "Available" &&
        resource.maintenanceStatus !== "Under Maintenance"
    );
  }, [resources]);

  const countByStatus = (status) => {
    return requests.filter((request) => request.status === status).length;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setMessageType("");
    setAlternatives([]);

    if (name === "resource") {
      const foundResource = resources.find((resource) => resource._id === value);
      setSelectedResource(foundResource || null);
    }
  };

  const validateForm = () => {
    if (!formData.eventName.trim()) return "Event name is required";
    if (!formData.resource) return "Resource selection is required";
    if (!formData.organizerName.trim()) return "Organizer name is required";
    if (!formData.requiredDate) return "Required date is required";
    if (!formData.startTime) return "Start time is required";
    if (!formData.endTime) return "End time is required";

    if (formData.endTime <= formData.startTime) {
      return "End time must be later than start time";
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      return "Quantity must be greater than 0";
    }

    if (!formData.purpose.trim()) return "Purpose is required";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setAlternatives([]);

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      const response = await api.post("/resource-requests", {
        ...formData,
        quantity: Number(formData.quantity),
      });

      setMessage(response.data.message || "Resource request submitted successfully");
      setMessageType("success");

      setFormData({
        eventName: "",
        resource: "",
        organizerName: loggedUser?.name || "Organizer",
        requiredDate: "",
        startTime: "",
        endTime: "",
        quantity: 1,
        purpose: "",
      });

      setSelectedResource(null);
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to submit resource request");
      setMessageType("error");

      if (error.response?.data?.alternatives) {
        setAlternatives(error.response.data.alternatives);
      }
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Organizer Workspace</span>
          <h2>Reserve Resource</h2>
          <p>
            Request venues, equipment, furniture or other event resources.
            Requests are sent to the Resource Manager for approval.
          </p>
        </div>

        <div className="module-role-card">
          <span>Available Resources</span>
          <strong>{availableResources.length}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{requests.length}</h3>
          <p>My Requests</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">02</span>
          <h3>{countByStatus("Pending")}</h3>
          <p>Pending</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{countByStatus("Approved")}</h3>
          <p>Approved</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{countByStatus("Rejected")}</h3>
          <p>Rejected</p>
        </div>
      </section>

      <section className="add-resource-layout">
        <div className="add-resource-info-card">
          <h3>Reservation Rules</h3>

          <div className="rule-item">
            <strong>01</strong>
            <p>Organizer can request available resources for events.</p>
          </div>

          <div className="rule-item">
            <strong>02</strong>
            <p>Same resource cannot be double-booked for the same time slot.</p>
          </div>

          <div className="rule-item">
            <strong>03</strong>
            <p>Request status will remain Pending until Resource Manager approval.</p>
          </div>

          <div className="rule-item">
            <strong>04</strong>
            <p>Organizer receives notifications after approval or rejection.</p>
          </div>
        </div>

        <div className="add-resource-form-card">
          <div className="form-heading">
            <h3>Reservation Request Form</h3>
            <p>Fill in the event and resource details below.</p>
          </div>

          {message && (
            <div className={messageType === "success" ? "success-box" : "error-box"}>
              {message}
            </div>
          )}

          {alternatives.length > 0 && (
            <div className="info-box">
              <strong>Alternative Resources:</strong>
              {alternatives.map((item, index) => (
                <p key={index}>{item.resourceName || item.name || item}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="Example: IT Workshop"
              />
            </div>

            <div className="form-group">
              <label>Select Resource</label>
              <select
                name="resource"
                value={formData.resource}
                onChange={handleChange}
              >
                <option value="">Choose an available resource</option>
                {availableResources.map((resource) => (
                  <option key={resource._id} value={resource._id}>
                    {resource.resourceName} - {resource.resourceType} -{" "}
                    {resource.location}
                  </option>
                ))}
              </select>
            </div>

            {selectedResource && (
              <div className="booking-card">
                <div className="booking-card-header">
                  <h3>{selectedResource.resourceName}</h3>
                  <span className="status available">{selectedResource.status}</span>
                </div>

                <p>
                  <strong>Type:</strong> {selectedResource.resourceType}
                </p>
                <p>
                  <strong>Location:</strong> {selectedResource.location}
                </p>
                <p>
                  <strong>Quantity / Capacity:</strong> {selectedResource.quantity}
                </p>
                <p>
                  <strong>Maintenance:</strong>{" "}
                  {selectedResource.maintenanceStatus}
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Organizer Name</label>
                <input
                  type="text"
                  name="organizerName"
                  value={formData.organizerName}
                  onChange={handleChange}
                  placeholder="Example: Organizer"
                />
              </div>

              <div className="form-group">
                <label>Required Date</label>
                <input
                  type="date"
                  name="requiredDate"
                  value={formData.requiredDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Quantity Required</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Example: Workshop presentation and sound setup"
                rows="4"
              ></textarea>
            </div>

            <button type="submit" className="primary-button">
              Submit Resource Request
            </button>
          </form>
        </div>
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>My Recent Requests</h2>
            <p className="subtitle">
              Track your submitted reservation requests and approval status.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-card">No requests found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Purpose</th>
                </tr>
              </thead>

              <tbody>
                {requests.slice(0, 5).map((request) => (
                  <tr key={request._id}>
                    <td>{request.eventName}</td>
                    <td>{request.resource?.resourceName || "Resource not found"}</td>
                    <td>{new Date(request.requiredDate).toLocaleDateString()}</td>
                    <td>
                      {request.startTime} - {request.endTime}
                    </td>
                    <td>
                      <span className={`status ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.purpose}</td>
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

export default ReserveResource;