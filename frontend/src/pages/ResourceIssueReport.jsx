import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function ResourceIssueReport() {
  const loggedUser = JSON.parse(localStorage.getItem("resourceUser"));

  const [resources, setResources] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    resource: "",
    reportedBy: loggedUser?.name || "Organizer",
    issueType: "",
    description: "",
  });

  const [selectedResource, setSelectedResource] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const resourcesResponse = await api.get("/resources");
      setResources(resourcesResponse.data.data || []);

      try {
        const issuesResponse = await api.get("/resource-issues");
        const allIssues = issuesResponse.data.data || [];

        const organizerIssues = allIssues.filter(
          (issue) =>
            issue.reportedBy === formData.reportedBy ||
            issue.reportedBy === loggedUser?.name
        );

        setMyIssues(organizerIssues);
      } catch (error) {
        setMyIssues([]);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load resources");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableResourceCount = useMemo(() => {
    return resources.filter((resource) => resource.status === "Available").length;
  }, [resources]);

  const underMaintenanceCount = useMemo(() => {
    return resources.filter(
      (resource) => resource.maintenanceStatus === "Under Maintenance"
    ).length;
  }, [resources]);

  const countByStatus = (status) => {
    return myIssues.filter((issue) => issue.status === status).length;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
    setMessageType("");

    if (name === "resource") {
      const foundResource = resources.find((resource) => resource._id === value);
      setSelectedResource(foundResource || null);
    }
  };

  const validateForm = () => {
    if (!formData.resource) return "Resource selection is required";
    if (!formData.reportedBy.trim()) return "Reporter name is required";
    if (!formData.issueType) return "Issue type is required";
    if (!formData.description.trim()) return "Issue description is required";

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
      const response = await api.post("/resource-issues", formData);

      setMessage(
        response.data.message ||
          "Resource issue reported successfully. Resource Manager has been notified."
      );
      setMessageType("success");

      setFormData({
        resource: "",
        reportedBy: loggedUser?.name || "Organizer",
        issueType: "",
        description: "",
      });

      setSelectedResource(null);
      await fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to report issue");
      setMessageType("error");
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Organizer Workspace</span>
          <h2>Issue Report</h2>
          <p>
            Report damaged, missing or faulty resources. The Resource Manager
            will review the issue and update the resource maintenance status.
          </p>
        </div>

        <div className="module-role-card">
          <span>My Reported Issues</span>
          <strong>{myIssues.length}</strong>
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
          <h3>{availableResourceCount}</h3>
          <p>Available</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{countByStatus("Reported")}</h3>
          <p>My Reported</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{underMaintenanceCount}</h3>
          <p>Under Maintenance</p>
        </div>
      </section>

      <section className="add-resource-layout">
        <div className="add-resource-info-card">
          <h3>Issue Reporting Rules</h3>

          <div className="rule-item">
            <strong>01</strong>
            <p>Organizer can report resource damages or technical issues.</p>
          </div>

          <div className="rule-item">
            <strong>02</strong>
            <p>Issue is first saved as Reported and sent to Resource Manager.</p>
          </div>

          <div className="rule-item">
            <strong>03</strong>
            <p>When Resource Manager moves it to In Review, resource becomes unavailable.</p>
          </div>

          <div className="rule-item">
            <strong>04</strong>
            <p>After resolving, the resource becomes Available and Good again.</p>
          </div>
        </div>

        <div className="add-resource-form-card">
          <div className="form-heading">
            <h3>Report Resource Issue</h3>
            <p>Fill in the details clearly so the issue can be reviewed quickly.</p>
          </div>

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
                <option value="">Choose resource</option>
                {resources.map((resource) => (
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
                  <span
                    className={
                      selectedResource.status === "Available"
                        ? "status available"
                        : "status unavailable"
                    }
                  >
                    {selectedResource.status}
                  </span>
                </div>

                <p>
                  <strong>Type:</strong> {selectedResource.resourceType}
                </p>
                <p>
                  <strong>Location:</strong> {selectedResource.location}
                </p>
                <p>
                  <strong>Maintenance:</strong>{" "}
                  {selectedResource.maintenanceStatus}
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Reported By</label>
                <input
                  type="text"
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  placeholder="Example: Organizer"
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
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>My Issue Reports</h2>
            <p className="subtitle">
              Track issues you submitted and their current review status.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading issue reports...</p>
        ) : myIssues.length === 0 ? (
          <div className="empty-card">No issue reports found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Issue Type</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Manager Remark</th>
                </tr>
              </thead>

              <tbody>
                {myIssues.slice(0, 5).map((issue) => (
                  <tr key={issue._id}>
                    <td>{issue.resource?.resourceName || "Resource not found"}</td>
                    <td>{issue.issueType}</td>
                    <td>
                      <span className={`status ${issue.status.toLowerCase()}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{issue.description}</td>
                    <td>{issue.adminRemark || "-"}</td>
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

export default ResourceIssueReport;