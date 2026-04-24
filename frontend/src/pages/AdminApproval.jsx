import { useEffect, useState } from "react";
import axios from "axios";

function AdminApproval() {
  const [requests, setRequests] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/v1/resource-requests"
      );

      setRequests(response.data.data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load resource requests";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRemarkChange = (requestId, value) => {
    setRemarks({
      ...remarks,
      [requestId]: value,
    });
  };

  const updateRequestStatus = async (requestId, status) => {
    const adminRemark = remarks[requestId] || "";

    if (status === "Rejected" && !adminRemark.trim()) {
      setMessage("Admin remark is required when rejecting a request");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/resource-requests/${requestId}/status`,
        {
          status,
          adminRemark:
            adminRemark ||
            (status === "Approved"
              ? "Approved by admin"
              : "Rejected by admin"),
        }
      );

      setMessage(response.data.message);
      setMessageType("success");

      setRemarks({
        ...remarks,
        [requestId]: "",
      });

      await fetchRequests();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update request status";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Admin Approval</h1>
            <p className="subtitle">
              Review resource reservation requests and approve or reject pending
              requests.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchRequests}>
            Refresh
          </button>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading resource requests...</p>
        ) : requests.length === 0 ? (
          <p>No resource requests found.</p>
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
                  <th>Admin Remark</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.eventName}</td>
                    <td>
                      {request.resource?.resourceName || "Resource not found"}
                    </td>
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
                          placeholder="Admin remark"
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
      </div>
    </div>
  );
}

export default AdminApproval;