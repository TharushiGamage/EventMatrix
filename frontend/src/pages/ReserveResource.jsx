import { useEffect, useState } from "react";
import api from "../utils/api";

function ReserveResource() {
  const [resources, setResources] = useState([]);
  const [alternativeResources, setAlternativeResources] = useState([]);
  const [formData, setFormData] = useState({
    eventName: "",
    resource: "",
    organizerName: "",
    requiredDate: "",
    startTime: "",
    endTime: "",
    quantity: "",
    purpose: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchResources = async () => {
    try {
      const response = await api.get("/resources");
      setResources(response.data.data || []);
    } catch (error) {
      setMessage("Failed to load resources");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchResources();

    const loggedUser = JSON.parse(localStorage.getItem("resourceUser"));
    if (loggedUser?.name) {
      setFormData((previousData) => ({
        ...previousData,
        organizerName: loggedUser.name,
      }));
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setAlternativeResources([]);
  };

  const validateForm = () => {
    if (!formData.eventName.trim()) {
      return "Event name is required";
    }

    if (!formData.resource) {
      return "Resource selection is required";
    }

    if (!formData.organizerName.trim()) {
      return "Organizer name is required";
    }

    if (!formData.requiredDate) {
      return "Required date is required";
    }

    const selectedDate = new Date(formData.requiredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Required date must be today or a future date";
    }

    if (!formData.startTime) {
      return "Start time is required";
    }

    if (!formData.endTime) {
      return "End time is required";
    }

    if (formData.endTime <= formData.startTime) {
      return "End time must be after start time";
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      return "Quantity must be greater than 0";
    }

    if (!formData.purpose.trim()) {
      return "Purpose is required";
    }

    return "";
  };

  const handleAlternativeSelect = (resourceId) => {
    setFormData({
      ...formData,
      resource: resourceId,
    });

    setMessage("Alternative resource selected. You can submit the request again.");
    setMessageType("success");
    setAlternativeResources([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");
    setAlternativeResources([]);

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

      setMessage(
        `${response.data.message}. Current status: ${response.data.data.status}`
      );
      setMessageType("success");

      const loggedUser = JSON.parse(localStorage.getItem("resourceUser"));

      setFormData({
        eventName: "",
        resource: "",
        organizerName: loggedUser?.name || "",
        requiredDate: "",
        startTime: "",
        endTime: "",
        quantity: "",
        purpose: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create resource request";

      setMessage(errorMessage);
      setMessageType("error");

      if (error.response?.data?.alternativeResources) {
        setAlternativeResources(error.response.data.alternativeResources);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1>Reserve Resource</h1>
        <p className="subtitle">
          Request venues or equipment for university events. Submitted requests
          will be saved as Pending until admin approval.
        </p>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {alternativeResources.length > 0 && (
          <div className="info-box">
            <h3>Suggested Alternative Resources</h3>
            <p>
              The selected resource is not available for this date and time.
              You can choose one of the available resources below.
            </p>

            {alternativeResources.map((resource) => (
              <div key={resource._id} className="alternative-item">
                <div>
                  <strong>{resource.resourceName}</strong>
                  <p>
                    {resource.resourceType} | {resource.location} | Quantity:{" "}
                    {resource.quantity}
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleAlternativeSelect(resource._id)}
                >
                  Select
                </button>
              </div>
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
              placeholder="Example: Tech Club Workshop"
            />
          </div>

          <div className="form-group">
            <label>Select Resource</label>
            <select
              name="resource"
              value={formData.resource}
              onChange={handleChange}
            >
              <option value="">Select a resource</option>
              {resources.map((resource) => (
                <option key={resource._id} value={resource._id}>
                  {resource.resourceName} - {resource.resourceType} -{" "}
                  {resource.location} - {resource.status} -{" "}
                  {resource.maintenanceStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Organizer Name</label>
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              placeholder="Example: Thilini Abeykoon"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Required Date</label>
              <input
                type="date"
                name="requiredDate"
                value={formData.requiredDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
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
            <label>Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Explain why this resource is needed"
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="primary-button">
            Submit Resource Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReserveResource;