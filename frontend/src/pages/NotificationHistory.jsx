import { useEffect, useState } from "react";
import api from "../utils/api";

function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/notifications");
      const data = response.data.data || [];

      setNotifications(data);
      applyFilters(data, typeFilter, statusFilter);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load notifications";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const applyFilters = (data, selectedType, selectedStatus) => {
    let filtered = [...data];

    if (selectedType !== "All") {
      filtered = filtered.filter(
        (notification) => notification.type === selectedType
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (notification) => notification.status === selectedStatus
      );
    }

    setFilteredNotifications(filtered);
  };

  const handleTypeFilter = (event) => {
    const selectedType = event.target.value;
    setTypeFilter(selectedType);
    applyFilters(notifications, selectedType, statusFilter);
  };

  const handleStatusFilter = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);
    applyFilters(notifications, typeFilter, selectedStatus);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);

      setMessage(response.data.message || "Notification marked as read");
      setMessageType("success");

      await fetchNotifications();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark notification as read";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put("/notifications/mark-all-read");

      setMessage(response.data.message || "All notifications marked as read");
      setMessageType("success");

      await fetchNotifications();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to mark all notifications as read";

      setMessage(errorMessage);
      setMessageType("error");
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(
      (notification) => notification.status === "Unread"
    ).length;
  };

  const getTotalByType = (type) => {
    return notifications.filter((notification) => notification.type === type)
      .length;
  };

  const formatDateTime = (dateValue) => {
    return new Date(dateValue).toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Notification History</h1>
            <p className="subtitle">
              View confirmation messages and system notifications related to
              resource requests, approvals, rejections, issue reports, and
              resolved issues.
            </p>
          </div>

          <div className="action-buttons">
            <button className="secondary-button" onClick={fetchNotifications}>
              Refresh
            </button>

            <button className="approve-button" onClick={markAllAsRead}>
              Mark All Read
            </button>
          </div>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        <div className="summary-row">
          <div className="summary-box">
            <h3>{notifications.length}</h3>
            <p>Total Messages</p>
          </div>

          <div className="summary-box">
            <h3>{getUnreadCount()}</h3>
            <p>Unread</p>
          </div>

          <div className="summary-box">
            <h3>{getTotalByType("Request")}</h3>
            <p>Requests</p>
          </div>

          <div className="summary-box">
            <h3>{getTotalByType("Issue")}</h3>
            <p>Issues</p>
          </div>
        </div>

        <div className="calendar-controls">
          <div className="filter-row">
            <label>Filter by Type</label>
            <select value={typeFilter} onChange={handleTypeFilter}>
              <option value="All">All Types</option>
              <option value="Request">Request</option>
              <option value="Approval">Approval</option>
              <option value="Issue">Issue</option>
              <option value="System">System</option>
            </select>
          </div>

          <div className="filter-row">
            <label>Filter by Status</label>
            <select value={statusFilter} onChange={handleStatusFilter}>
              <option value="All">All Status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={
                  notification.status === "Unread"
                    ? "notification-card unread-card"
                    : "notification-card"
                }
              >
                <div className="notification-header">
                  <div>
                    <h3>{notification.title}</h3>
                    <p className="notification-date">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="notification-badges">
                    <span className="notification-type">
                      {notification.type}
                    </span>

                    <span
                      className={
                        notification.status === "Unread"
                          ? "status pending"
                          : "status resolved"
                      }
                    >
                      {notification.status}
                    </span>
                  </div>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-meta">
                  <span>
                    <strong>Recipient Role:</strong>{" "}
                    {notification.recipientRole}
                  </span>

                  <span>
                    <strong>Recipient:</strong>{" "}
                    {notification.recipientName || "All"}
                  </span>

                  {notification.relatedResource && (
                    <span>
                      <strong>Resource:</strong>{" "}
                      {notification.relatedResource.resourceName}
                    </span>
                  )}
                </div>

                {notification.status === "Unread" && (
                  <button
                    className="secondary-button"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationHistory;