import { useEffect, useState } from "react";
import api from "../utils/api";

function ResourceIssueManagement() {
  const [issues, setIssues] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);

      const response = await api.get("/resource-issues");
      setIssues(response.data.data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load resource issues";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleRemarkChange = (issueId, value) => {
    setRemarks({
      ...remarks,
      [issueId]: value,
    });
  };

  const updateIssueStatus = async (issueId, status) => {
    const adminRemark = remarks[issueId] || "";

    try {
      const response = await api.put(`/resource-issues/${issueId}/status`, {
        status,
        adminRemark:
          adminRemark ||
          (status === "Resolved"
            ? "Issue resolved and resource is ready to use"
            : "Issue is currently being reviewed"),
      });

      setMessage(response.data.message);
      setMessageType("success");

      setRemarks({
        ...remarks,
        [issueId]: "",
      });

      await fetchIssues();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update issue status";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Issue Management</h1>
            <p className="subtitle">
              View reported resource issues and mark them as In Review or
              Resolved. When an issue is resolved, the resource becomes
              Available again.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchIssues}>
            Refresh
          </button>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading resource issues...</p>
        ) : issues.length === 0 ? (
          <p>No resource issues found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Reported By</th>
                  <th>Status</th>
                  <th>Resource Status</th>
                  <th>Admin Remark</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td>{issue.resource?.resourceName || "Resource not found"}</td>
                    <td>{issue.issueType}</td>
                    <td>{issue.description}</td>
                    <td>{issue.reportedBy}</td>
                    <td>
                      <span className={`status ${issue.status.toLowerCase()}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>Status:</strong> {issue.resource?.status || "N/A"}
                      </div>
                      <div>
                        <strong>Maintenance:</strong>{" "}
                        {issue.resource?.maintenanceStatus || "N/A"}
                      </div>
                    </td>
                    <td>
                      {issue.status === "Resolved" ? (
                        issue.adminRemark || "-"
                      ) : (
                        <input
                          className="small-input"
                          type="text"
                          value={remarks[issue._id] || ""}
                          onChange={(event) =>
                            handleRemarkChange(issue._id, event.target.value)
                          }
                          placeholder="Admin remark"
                        />
                      )}
                    </td>
                    <td>
                      {issue.status === "Resolved" ? (
                        <span className="muted-text">Resolved</span>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="secondary-button"
                            onClick={() =>
                              updateIssueStatus(issue._id, "In Review")
                            }
                          >
                            In Review
                          </button>

                          <button
                            className="approve-button"
                            onClick={() =>
                              updateIssueStatus(issue._id, "Resolved")
                            }
                          >
                            Resolve
                          </button>
                        </div>
                      )}
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

export default ResourceIssueManagement;