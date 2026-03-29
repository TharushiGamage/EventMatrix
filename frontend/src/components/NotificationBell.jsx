import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [data, setData]       = useState({ notifications: [], unreadCount: 0 });
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef           = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationService.getAll();
      setData(result);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setData(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      notifications: prev.notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ),
    }));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
    setOpen(false);

    // Navigate based on type
    if (notification.type === 'new_user' && notification.relatedUser) {
      navigate(`/admin/users?userId=${notification.relatedUser}`);
    } else if (notification.type === 'new_event' && notification.relatedEvent) {
      navigate(`/feed/${notification.relatedEvent}`);
    } else if (['registration_approved', 'registration_rejected', 'waitlist_available'].includes(notification.type)) {
      navigate('/my-registrations');
    }
    // Add other navigation logic here if needed
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setData(prev => ({
      ...prev,
      unreadCount: 0,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
    }));
  };

  const handleClearAll = async () => {
    await notificationService.clearAll();
    setData({ notifications: [], unreadCount: 0 });
    setOpen(false);
  };

  const typeIcon = (type) => {
    if (type === 'registration_approved') return '✅';
    if (type === 'registration_rejected') return '❌';
    if (type === 'waitlist_available')    return '🔔';
    if (type === 'new_user')              return '👤';
    if (type === 'new_event')             return '🎉';
    return '📋';
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button
        className="notif-bell-btn"
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        title="Notifications"
        aria-label={`Notifications${data.unreadCount ? ` (${data.unreadCount} unread)` : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {data.unreadCount > 0 && (
          <span className="notif-count">{data.unreadCount > 9 ? '9+' : data.unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            <div>
              {data.unreadCount > 0 && (
                <button className="notif-mark-all" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
              {data.notifications.length > 0 && (
                <button className="notif-clear-all" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="notif-item notif-loading">Loading...</div>
            ) : data.notifications.length === 0 ? (
              <div className="notif-item notif-empty">No new notifications</div>
            ) : (
              data.notifications.map(n => (
                <div
                  key={n._id}
                  className={`notif-item ${n.isRead ? 'read' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="notif-icon">{typeIcon(n.type)}</div>
                  <div className="notif-content">
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-time">{formatDate(n.createdAt)}</span>
                  </div>
                  {!n.isRead && (
                    <button
                      className="notif-mark-one-read"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n._id);
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

