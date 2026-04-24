import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function ResourceUsageLog() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchUsageLogs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/resource-requests");
      setRequests(response.data.data || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load resource usage logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageLogs();
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "All") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const countByStatus = (status) => {
    return requests.filter((request) => request.status === status).length;
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Booking Records</span>
          <h2>Resource Usage Log</h2>
          <p>
            Track all resource reservation records, organizer details, booking
            dates, request status and usage history.
          </p>
        </div>

        <div className="module-role-card">
          <span>Total Logs</span>
          <strong>{requests.length}</strong>
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
            <h2>Reservation History</h2>
            <p className="subtitle">
              Filter resource usage logs by request status.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchUsageLogs}>
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

        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <p>Loading usage logs...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-card">No usage logs found.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Resource</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Purpose</th>
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
                    <td>{request.quantity}</td>
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

export default ResourceUsageLog;