import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function AdminApproval() {
  const [requests, setRequests] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resource-requests");
      setRequests(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load requests");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "All") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const countByStatus = (status) => {
    return requests.filter((request) => request.status === status).length;
  };

  const handleRemarkChange = (requestId, value) => {
    setRemarks({
      ...remarks,
      [requestId]: value,
    });
  };

  const updateRequestStatus = async (requestId, status) => {
    const managerRemark = remarks[requestId] || "";

    if (status === "Rejected" && !managerRemark.trim()) {
      setMessage("Manager remark is required when rejecting a request");
      setMessageType("error");
      return;
    }

    try {
      const response = await api.put(`/resource-requests/${requestId}/status`, {
        status,
        adminRemark:
          managerRemark ||
          (status === "Approved"
            ? "Approved by resource manager"
            : "Rejected by resource manager"),
      });

      setMessage(response.data.message);
      setMessageType("success");

      setRemarks({
        ...remarks,
        [requestId]: "",
      });

      await fetchRequests();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update request");
      setMessageType("error");
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Approval Workflow</span>
          <h2>Resource Request Approval</h2>
          <p>
            Review organizer resource requests, add manager remarks and approve
            or reject requests according to resource availability.
          </p>
        </div>

        <div className="module-role-card">
          <span>Pending Requests</span>
          <strong>{countByStatus("Pending")}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{requests.length}</h3>
          <p>Total Requests</p>
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

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>Request Queue</h2>
            <p className="subtitle">
              Pending requests can be approved or rejected by the Resource
              Manager.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchRequests}>
            Refresh
          </button>
        </div>

        <div className="module-filter-row single-filter">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading resource requests...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-card">No requests found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Resource</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Manager Remark</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.eventName}</td>
                    <td>{request.resource?.resourceName || "Resource not found"}</td>
                    <td>{request.organizerName}</td>
                    <td>{new Date(request.requiredDate).toLocaleDateString()}</td>
                    <td>
                      {request.startTime} - {request.endTime}
                    </td>
                    <td>
                      <span className={`status ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.status === "Pending" ? (
                        <input
                          className="small-input"
                          type="text"
                          value={remarks[request._id] || ""}
                          onChange={(event) =>
                            handleRemarkChange(request._id, event.target.value)
                          }
                          placeholder="Manager remark"
                        />
                      ) : (
                        request.adminRemark || "-"
                      )}
                    </td>
                    <td>
                      {request.status === "Pending" ? (
                        <div className="action-buttons">
                          <button
                            className="approve-button"
                            onClick={() =>
                              updateRequestStatus(request._id, "Approved")
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              updateRequestStatus(request._id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="muted-text">Completed</span>
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

export default AdminApproval;