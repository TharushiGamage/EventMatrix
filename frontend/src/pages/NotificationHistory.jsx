import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function NotificationHistory({ onNotificationUpdate }) {
  const [notifications, setNotifications] = useState([]);
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
      setNotifications(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load notifications");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (typeFilter !== "All") {
      filtered = filtered.filter(
        (notification) => notification.type === typeFilter
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (notification) => notification.status === statusFilter
      );
    }

    return filtered;
  }, [notifications, typeFilter, statusFilter]);

  const unreadCount = notifications.filter(
    (notification) => notification.status === "Unread"
  ).length;

  const countByType = (type) => {
    return notifications.filter((notification) => notification.type === type)
      .length;
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);

      setMessage(response.data.message || "Notification marked as read");
      setMessageType("success");

      await fetchNotifications();
      onNotificationUpdate?.();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to mark notification as read"
      );
      setMessageType("error");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put("/notifications/mark-all-read");

      setMessage(response.data.message || "All notifications marked as read");
      setMessageType("success");

      await fetchNotifications();
      onNotificationUpdate?.();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to mark notifications as read"
      );
      setMessageType("error");
    }
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Message Center</span>
          <h2>Notifications</h2>
          <p>
            View confirmation messages, approval updates, issue reports and
            system notifications related to resource workflows.
          </p>
        </div>

        <div className="module-role-card">
          <span>Unread Messages</span>
          <strong>{unreadCount}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{notifications.length}</h3>
          <p>Total Messages</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">02</span>
          <h3>{unreadCount}</h3>
          <p>Unread</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{countByType("Request")}</h3>
          <p>Requests</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{countByType("Issue")}</h3>
          <p>Issues</p>
        </div>
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>Message History</h2>
            <p className="subtitle">
              Filter notifications by type or read/unread status.
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

        <div className="module-filter-row">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Request">Request</option>
            <option value="Approval">Approval</option>
            <option value="Issue">Issue</option>
            <option value="System">System</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
          </select>
        </div>

        {message && (
          <div className={messageType === "success" ? "success-box" : "error-box"}>
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-card">No notifications found.</div>
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
                      {new Date(notification.createdAt).toLocaleString()}
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
      </section>
    </div>
  );
}

export default NotificationHistory;