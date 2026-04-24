import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function ResourceIssueManagement() {
  const [issues, setIssues] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resource-issues");
      setIssues(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load issues");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    if (statusFilter === "All") return issues;
    return issues.filter((issue) => issue.status === statusFilter);
  }, [issues, statusFilter]);

  const countByStatus = (status) => {
    return issues.filter((issue) => issue.status === status).length;
  };

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
      setMessage(error.response?.data?.message || "Failed to update issue");
      setMessageType("error");
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Maintenance Workflow</span>
          <h2>Issue Management</h2>
          <p>
            Review reported damages, technical issues and maintenance requests.
            Resolve issues after checking the resource condition.
          </p>
        </div>

        <div className="module-role-card">
          <span>Open Issues</span>
          <strong>{countByStatus("Reported") + countByStatus("In Review")}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{issues.length}</h3>
          <p>Total Issues</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">02</span>
          <h3>{countByStatus("Reported")}</h3>
          <p>Reported</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{countByStatus("In Review")}</h3>
          <p>In Review</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{countByStatus("Resolved")}</h3>
          <p>Resolved</p>
        </div>
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>Reported Resource Issues</h2>
            <p className="subtitle">
              Resource Manager can review issue reports and update their status.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchIssues}>
            Refresh
          </button>
        </div>

        <div className="module-filter-row single-filter">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Reported">Reported</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading resource issues...</p>
        ) : filteredIssues.length === 0 ? (
          <div className="empty-card">No issues found.</div>
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
                  <th>Manager Remark</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map((issue) => (
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
                          placeholder="Manager remark"
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
      </section>
    </div>
  );
}

export default ResourceIssueManagement;