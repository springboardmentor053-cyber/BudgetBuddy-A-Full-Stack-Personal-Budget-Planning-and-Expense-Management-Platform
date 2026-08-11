import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "../styles/notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        setError("Please log in to view notifications.");
        setLoading(false);
        return;
      }

      const response = await api.get("notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Notifications API response:",
        response.data
      );

      setNotifications(response.data);
      setError("");
    } catch (err) {
      console.error(
        "Notifications error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
  (notification) =>
    !notification.is_read &&
    !notification.is_archived
).length;

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");

      await api.patch(
        `notifications/${id}/`,
        {
          is_read: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Error marking notification as read:",
        err
      );
    }
  };

  const archiveNotification = async (id) => {
    try {
      const token = localStorage.getItem("access");

      await api.patch(
        `notifications/${id}/`,
        {
          is_archived: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_archived: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Error archiving notification:",
        err
      );
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") {
      return "priority-high";
    }

    if (priority === "MEDIUM") {
      return "priority-medium";
    }

    return "priority-low";
  };

  const getNotificationIcon = (type) => {
    if (type === "BUDGET_WARNING") {
      return "⚠️";
    }

    if (type === "BUDGET_LIMIT") {
      return "🚨";
    }

    if (type === "OVERSPENDING") {
      return "💸";
    }

    if (type === "GOAL_MILESTONE") {
      return "🎯";
    }

    if (type === "GOAL_COMPLETED") {
      return "🏆";
    }

    if (type === "SAVINGS_REMINDER") {
      return "💰";
    }

    if (type === "MONTHLY_REPORT") {
      return "📊";
    }

    return "🔔";
  };

  return (
    <div className="notifications-page">

      <Sidebar />

      <main className="notifications-main">

        {/* Header */}
        <div className="notifications-header">

          <div>
            <h1>Notifications 🔔</h1>

            <p>
              Stay updated with your financial activity.
            </p>
          </div>

          <div className="unread-count">
            {unreadCount} Unread
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="notifications-error">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="notifications-loading">
            Loading notifications...
          </div>
        ) : notifications.filter(
            (notification) =>
              !notification.is_archived
          ).length === 0 ? (

          /* Empty state */
          <div className="notifications-empty">

            <div className="empty-notification-icon">
              🔔
            </div>

            <h2>No Notifications</h2>

            <p>
              You're all caught up!
            </p>

          </div>

        ) : (

          /* Notification List */
          <div className="notifications-list">

            {notifications
              .filter(
                (notification) =>
                  !notification.is_archived
              )
              .map((notification) => (

                <div
                  key={notification.id}
                  className={`notification-card ${
                    notification.is_read
                      ? "notification-read"
                      : "notification-unread"
                  }`}
                >

                  {/* Icon */}
                  <div className="notification-icon">
                    {getNotificationIcon(
                      notification.notification_type
                    )}
                  </div>

                  {/* Content */}
                  <div className="notification-content">

                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      <span
                        className={`notification-priority ${getPriorityClass(
                          notification.priority
                        )}`}
                      >
                        {notification.priority}
                      </span>

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <small>
                      {new Date(
                        notification.created_at
                      ).toLocaleString("en-IN")}
                    </small>

                  </div>

                  {/* Actions */}
                  <div className="notification-actions">

                    {!notification.is_read && (
                      <button
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        archiveNotification(
                          notification.id
                        )
                      }
                    >
                      Archive
                    </button>

                  </div>

                </div>

              ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Notifications;