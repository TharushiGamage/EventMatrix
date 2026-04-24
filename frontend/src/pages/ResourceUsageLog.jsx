import { useEffect, useState } from "react";
import axios from "axios";

function ResourceUsageLog() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchUsageLogs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://localhost:5000/api/v1/resource-requests"
      );

      const data = response.data.data || [];
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load resource usage logs";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageLogs();
  }, []);

  const handleStatusFilter = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);

    if (selectedStatus === "All") {
      setFilteredRequests(requests);
      return;
    }

    const filtered = requests.filter(
      (request) => request.status === selectedStatus
    );

    setFilteredRequests(filtered);
  };

  const getTotalByStatus = (status) => {
    return requests.filter((request) => request.status === status).length;
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Resource Usage Log</h1>
            <p className="subtitle">
              View resource reservation history, event usage details, request
              status, and organizer information.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchUsageLogs}>
            Refresh
          </button>
        </div>

        {message && <div className="error-box">{message}</div>}

        <div className="summary-row">
          <div className="summary-box">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>

          <div className="summary-box">
            <h3>{getTotalByStatus("Pending")}</h3>
            <p>Pending</p>
          </div>

          <div className="summary-box">
            <h3>{getTotalByStatus("Approved")}</h3>
            <p>Approved</p>
          </div>

          <div className="summary-box">
            <h3>{getTotalByStatus("Rejected")}</h3>
            <p>Rejected</p>
          </div>
        </div>

        <div className="filter-row">
          <label>Filter by Status</label>
          <select value={statusFilter} onChange={handleStatusFilter}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p>Loading usage logs...</p>
        ) : filteredRequests.length === 0 ? (
          <p>No usage logs found.</p>
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
                    <td>
                      {request.resource?.resourceName || "Resource not found"}
                    </td>
                    <td>{request.organizerName}</td>
                    <td>
                      {new Date(request.requiredDate).toLocaleDateString()}
                    </td>
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
      </div>
    </div>
  );
}

export default ResourceUsageLog;