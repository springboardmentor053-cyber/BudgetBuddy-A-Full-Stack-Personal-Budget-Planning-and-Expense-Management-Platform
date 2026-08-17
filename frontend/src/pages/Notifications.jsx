import { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";

function Notifications() {

  // =====================================================
  // API
  // =====================================================

  const API =
    "http://127.0.0.1:8000/api/notifications/";

  // =====================================================
  // STATE
  // =====================================================

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [processingId, setProcessingId] =
    useState(null);

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("access");
  };

  const getHeaders = () => {
    return {
      Authorization:
        `Bearer ${getToken()}`,
    };
  };

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async (
    showRefreshLoader = false
  ) => {

    try {

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {

        setError(
          "Please login to view notifications."
        );

        return;
      }

      const response =
        await axios.get(
          API,
          {
            headers: getHeaders(),
          }
        );

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

      setNotifications(data);

    } catch (err) {

      console.error(
        "Notification Fetch Error:",
        err
      );

      if (
        err.response?.status === 401
      ) {

        setError(
          "Your login session has expired. Please login again."
        );

      } else {

        setError(
          "Unable to load notifications."
        );

      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchNotifications();

  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (id) => {

    try {

      setProcessingId(id);
      setError("");
      setSuccess("");

      await axios.patch(

        `${API}${id}/mark-read/`,

        {},

        {
          headers: getHeaders(),
        }

      );

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id === id
                ? {
                    ...notification,
                    is_read: true,
                  }
                : notification
          )
      );

      setSuccess(
        "Notification marked as read."
      );

    } catch (err) {

      console.error(
        "Mark Read Error:",
        err
      );

      setError(
        getBackendError(
          err,
          "Unable to mark notification as read."
        )
      );

    } finally {

      setProcessingId(null);

    }

  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {

    const unread =
      notifications.filter(
        (notification) =>
          !notification.is_read
      );

    if (unread.length === 0) {

      setSuccess(
        "All notifications are already read."
      );

      return;

    }

    try {

      setProcessingId("all");

      setError("");
      setSuccess("");

      /*
        We use the existing mark-read endpoint
        for each unread notification.

        This means you don't need a new backend
        endpoint just for "Mark all as read".
      */

      await Promise.all(

        unread.map(
          (notification) =>
            axios.patch(
              `${API}${notification.id}/mark-read/`,
              {},
              {
                headers: getHeaders(),
              }
            )
        )

      );

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      setSuccess(
        "All notifications marked as read."
      );

    } catch (err) {

      console.error(
        "Mark All Read Error:",
        err
      );

      setError(
        getBackendError(
          err,
          "Unable to mark all notifications as read."
        )
      );

    } finally {

      setProcessingId(null);

    }

  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this notification?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setProcessingId(id);

      setError("");
      setSuccess("");

      await axios.delete(

        `${API}${id}/`,

        {
          headers: getHeaders(),
        }

      );

      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              notification.id !== id
          )
      );

      setSuccess(
        "Notification deleted successfully."
      );

    } catch (err) {

      console.error(
        "Delete Notification Error:",
        err
      );

      setError(
        getBackendError(
          err,
          "Unable to delete notification."
        )
      );

    } finally {

      setProcessingId(null);

    }

  };

  // =====================================================
  // BACKEND ERROR
  // =====================================================

  const getBackendError = (
    err,
    fallback
  ) => {

    if (!err.response?.data) {
      return fallback;
    }

    const data =
      err.response.data;

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const messages =
      Object.values(data)
        .flat()
        .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }

    return fallback;

  };

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  const readCount =
    notifications.length -
    unreadCount;

  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon = (
    type
  ) => {

    switch (
      String(type || "").toUpperCase()
    ) {

      case "BUDGET":
        return "📊";

      case "SAVINGS":
        return "🎯";

      case "EXPENSE":
        return "💸";

      case "INCOME":
        return "💰";

      case "REPORT":
        return "📑";

      case "ANALYTICS":
        return "📈";

      case "SECURITY":
        return "🔐";

      default:
        return "🔔";

    }

  };

  // =====================================================
  // TYPE NAME
  // =====================================================

  const getTypeName = (type) => {

    if (!type) {
      return "General";
    }

    return String(type)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );

  };

  // =====================================================
  // PRIORITY
  // =====================================================

  const getPriorityClass = (
    priority
  ) => {

    switch (
      String(priority || "")
        .toUpperCase()
    ) {

      case "HIGH":
        return "priority-high";

      case "LOW":
        return "priority-low";

      default:
        return "priority-medium";

    }

  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "Unknown date";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };

  // =====================================================
  // TIME FORMAT
  // =====================================================

  const formatTime = (
    date
  ) => {

    if (!date) {
      return "";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    return parsed.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="notifications-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="notifications-header">

        <div>

          <span className="notifications-eyebrow">
            🔔 NOTIFICATION CENTER
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your financial activity,
            budgets, savings and account alerts.
          </p>

        </div>


        <div className="header-actions">

          <div className="unread-counter">

            <span>
              Unread
            </span>

            <strong>
              {unreadCount}
            </strong>

          </div>


          <button
            type="button"
            className="refresh-button"
            onClick={() =>
              fetchNotifications(true)
            }
            disabled={refreshing}
          >

            {refreshing
              ? "↻ Refreshing..."
              : "↻ Refresh"}

          </button>

        </div>

      </div>


      {/* =================================================
          ALERTS
      ================================================= */}

      {success && (

        <div className="notification-alert success-alert">

          <span>
            ✅
          </span>

          <p>
            {success}
          </p>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            ×
          </button>

        </div>

      )}


      {error && (

        <div className="notification-alert error-alert">

          <span>
            ⚠️
          </span>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchNotifications()
            }
          >
            Try Again
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="notification-summary">

        <div className="notification-summary-card">

          <div className="summary-icon purple">
            🔔
          </div>

          <div>

            <span>
              Total Notifications
            </span>

            <h2>
              {notifications.length}
            </h2>

            <small>
              All account activity
            </small>

          </div>

        </div>


        <div className="notification-summary-card">

          <div className="summary-icon orange">
            📩
          </div>

          <div>

            <span>
              Unread
            </span>

            <h2>
              {unreadCount}
            </h2>

            <small>
              Need your attention
            </small>

          </div>

        </div>


        <div className="notification-summary-card">

          <div className="summary-icon green">
            ✅
          </div>

          <div>

            <span>
              Read
            </span>

            <h2>
              {readCount}
            </h2>

            <small>
              Already reviewed
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          TOOLBAR
      ================================================= */}

      {!loading &&
        notifications.length > 0 && (

          <div className="notification-toolbar">

            <div>

              <span className="section-label">
                ACTIVITY
              </span>

              <h2>
                Your Notifications
              </h2>

            </div>


            <button
              type="button"
              className="mark-all-button"
              onClick={markAllAsRead}
              disabled={
                unreadCount === 0 ||
                processingId === "all"
              }
            >

              {processingId === "all"
                ? "Marking..."
                : "✓ Mark All as Read"}

            </button>

          </div>

        )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="notification-empty-state">

          <div className="notification-spinner"></div>

          <h3>
            Loading notifications...
          </h3>

          <p>
            Fetching your latest financial activity.
          </p>

        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        notifications.length === 0 && (

          <div className="notification-empty-state">

            <div className="empty-notification-icon">
              🎉
            </div>

            <h3>
              You're all caught up!
            </h3>

            <p>
              You don't have any notifications right now.
              We'll show your financial activity here.
            </p>

          </div>

        )}


      {/* =================================================
          NOTIFICATION LIST
      ================================================= */}

      {!loading &&
        notifications.length > 0 && (

          <div className="notification-list">

            {notifications.map(
              (notification) => {

                const isUnread =
                  !notification.is_read;

                const type =
                  String(
                    notification.notification_type ||
                    "GENERAL"
                  ).toUpperCase();

                const priority =
                  String(
                    notification.priority ||
                    "MEDIUM"
                  ).toUpperCase();

                return (

                  <div
                    className={
                      `notification-card ${
                        isUnread
                          ? "unread"
                          : "read"
                      }`
                    }
                    key={notification.id}
                  >

                    {/* UNREAD INDICATOR */}

                    {isUnread && (

                      <span className="unread-dot"></span>

                    )}


                    {/* TOP */}

                    <div className="notification-card-top">

                      <div
                        className={
                          `notification-icon type-${type.toLowerCase()}`
                        }
                      >
                        {getNotificationIcon(type)}
                      </div>


                      <div className="notification-title-area">

                        <div className="notification-title-row">

                          <h3>
                            {notification.title}
                          </h3>

                          <span
                            className={
                              `notification-priority ${
                                getPriorityClass(
                                  priority
                                )
                              }`
                            }
                          >
                            {priority}
                          </span>

                        </div>


                        <span className="notification-type">
                          {getTypeName(type)}
                        </span>

                      </div>


                      <div className="notification-status">

                        {isUnread
                          ? "● Unread"
                          : "✓ Read"}

                      </div>

                    </div>


                    {/* MESSAGE */}

                    <p className="notification-message-text">
                      {notification.message}
                    </p>


                    {/* META */}

                    <div className="notification-meta">

                      <span>
                        🗓️{" "}
                        {formatDate(
                          notification.created_at
                        )}
                      </span>

                      <span>
                        🕐{" "}
                        {formatTime(
                          notification.created_at
                        )}
                      </span>

                    </div>


                    {/* ACTIONS */}

                    <div className="notification-actions">

                      {isUnread && (

                        <button
                          type="button"
                          className="read-btn"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          disabled={
                            processingId ===
                            notification.id
                          }
                        >

                          {processingId ===
                          notification.id

                            ? "Marking..."

                            : "✓ Mark as Read"}

                        </button>

                      )}


                      <button
                        type="button"
                        className="delete-notification-btn"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                        disabled={
                          processingId ===
                          notification.id
                        }
                      >

                        🗑️ Delete

                      </button>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

    </div>

  );

}

export default Notifications;