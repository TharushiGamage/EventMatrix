import { useEffect, useState } from "react";
import axios from "axios";

function ResourceIssueReport() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resource: "",
    reportedBy: "",
    issueType: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/v1/resources");
      setResources(response.data.data || []);
    } catch (error) {
      setMessage("Failed to load resources");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.resource) {
      return "Resource selection is required";
    }

    if (!formData.reportedBy.trim()) {
      return "Reporter name is required";
    }

    if (!formData.issueType) {
      return "Issue type is required";
    }

    if (!formData.description.trim()) {
      return "Issue description is required";
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
      const response = await axios.post(
        "http://localhost:5000/api/v1/resource-issues",
        formData
      );

      setMessage(response.data.message);
      setMessageType("success");

      setFormData({
        resource: "",
        reportedBy: "",
        issueType: "",
        description: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to report issue";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1>Damage / Issue Reporting</h1>
        <p className="subtitle">
          Report damages, missing items, technical issues, or maintenance
          requirements for university resources.
        </p>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
                  {resource.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reported By</label>
            <input
              type="text"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleChange}
              placeholder="Example: Thilini Abeykoon"
            />
          </div>

          <div className="form-group">
            <label>Issue Type</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
            >
              <option value="">Select issue type</option>
              <option value="Damage">Damage</option>
              <option value="Missing Item">Missing Item</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Maintenance Required">Maintenance Required</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Issue Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue clearly"
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="primary-button">
            Submit Issue Report
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResourceIssueReport;