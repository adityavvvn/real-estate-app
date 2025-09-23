import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const pollTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    const scheduleNextPoll = () => {
      // jitter between 8-12s to avoid thundering herd
      const delay = 8000 + Math.floor(Math.random() * 4000);
      pollTimeoutRef.current = setTimeout(async () => {
        await fetchNotifications();
        scheduleNextPoll();
      }, delay);
    };

    const handleFocus = async () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(pollTimeoutRef.current);
        await fetchNotifications();
        scheduleNextPoll();
      }
    };

    // initial fetch and start polling
    fetchNotifications();
    scheduleNextPoll();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearTimeout(pollTimeoutRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [token]);

  const fetchNotifications = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
    } catch (error) {
      // keep silent to avoid console spam; could add retry/backoff if needed
      // console.error('Error fetching notifications:', error);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/auth/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications when dropdown is opened
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(); // Refresh when opening dropdown
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'inquiry':
        return '💬';
      default:
        return '🔔';
    }
  };

  if (!token) return null;

  return (
    <div className="notification-bell">
      <div className="notification-icon" onClick={handleBellClick}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                disabled={loading}
                className="mark-all-read"
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className="notification-icon-small">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <p>{notification.message}</p>
                      <small>{formatDate(notification.createdAt)}</small>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification._id)}
                        className="mark-read-btn"
                      >
                        Mark read
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification._id)}
                      className="delete-btn"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 