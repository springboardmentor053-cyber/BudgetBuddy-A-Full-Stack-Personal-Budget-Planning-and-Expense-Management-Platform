import { useEffect, useState } from "react";
import api from "../api";
import "../styles/notifications.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {

    try {

      const response = await api.get("notifications/");

      setNotifications(response.data);

    } catch (error) {

      console.error("Error fetching notifications:", error);

      setErrorMessage("Unable to load notifications.");

    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);


  // =====================================================
  // DELETE CONFIRMATION
  // =====================================================

  const openDeleteConfirmation = (notification) => {
    setDeleteId(notification.id);
    setDeleteTitle(notification.title);
    setMessage("");
    setErrorMessage("");
  };


  const closeDeleteConfirmation = () => {
    setDeleteId(null);
    setDeleteTitle("");
  };


  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const removeNotification = async () => {

    if (!deleteId) return;

    setMessage("");
    setErrorMessage("");

    try {

      await api.delete(`notifications/${deleteId}/`);

      setNotifications(
        (prev) => prev.filter((n) => n.id !== deleteId)
      );

      closeDeleteConfirmation();

      setMessage("Notification removed successfully.");

      setTimeout(() => setMessage(""), 4000);

    } catch (error) {

      console.error("Error deleting notification:", error);

      closeDeleteConfirmation();

      setErrorMessage(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Unable to remove notification."
      );

    }
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) =>
    new Date(date).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });


  return (

    <div className="notifications-page">

      <div className="notifications-header">

        <div>
          <div className="notifications-eyebrow">ACCOUNT</div>
          <h1>Notifications</h1>
          <p>Stay updated with important financial alerts and account activity.</p>
        </div>

        <div className="notifications-header-icon">
          <i className="bi bi-bell-fill"></i>
        </div>

      </div>


      {message && (
        <div className="notification-alert success">
          <div className="notification-alert-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div>
            <strong>Success</strong>
            <p>{message}</p>
          </div>
          <button type="button" onClick={() => setMessage("")}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}


      {errorMessage && (
        <div className="notification-alert error">
          <div className="notification-alert-icon">
            <i className="bi bi-exclamation-circle-fill"></i>
          </div>
          <div>
            <strong>Error</strong>
            <p>{errorMessage}</p>
          </div>
          <button type="button" onClick={() => setErrorMessage("")}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}


      <div className="notifications-summary">

        <div className="notifications-summary-card">
          <div className="notifications-summary-icon">
            <i className="bi bi-bell-fill"></i>
          </div>
          <div>
            <span>TOTAL NOTIFICATIONS</span>
            <strong>{notifications.length}</strong>
            <small>Notifications available</small>
          </div>
        </div>

        <div className="notifications-summary-card">
          <div className="notifications-summary-icon blue">
            <i className="bi bi-check2-circle"></i>
          </div>
          <div>
            <span>ACCOUNT STATUS</span>
            <strong>Active</strong>
            <small>Your account is up to date</small>
          </div>
        </div>

      </div>


      <div className="notifications-card">

        <div className="notifications-card-header">
          <div>
            <h2>Recent Notifications</h2>
            <p>Your latest financial alerts and updates.</p>
          </div>
          <div className="notifications-count">{notifications.length}</div>
        </div>

        {notifications.length === 0 ? (

          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              <i className="bi bi-check2-circle"></i>
            </div>
            <h3>You're all caught up!</h3>
            <p>You don't have any notifications right now.</p>
          </div>

        ) : (

          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">

                <div className="notification-item-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>

                <div className="notification-item-content">
                  <div className="notification-item-top">
                    <h3>{notification.title}</h3>
                    <span className="notification-badge">ALERT</span>
                  </div>
                  <p>{notification.message}</p>
                  <div className="notification-date">
                    <i className="bi bi-clock"></i>
                    {formatDate(notification.created_at)}
                  </div>
                </div>

                <button
                  type="button"
                  className="notification-remove-btn"
                  title="Remove notification"
                  onClick={() => openDeleteConfirmation(notification)}
                >
                  <i className="bi bi-trash3"></i>
                </button>

              </div>
            ))}
          </div>

        )}

      </div>


      {deleteId && (
        <div className="notification-modal-overlay" onClick={closeDeleteConfirmation}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>

            <div className="notification-modal-icon">
              <i className="bi bi-trash3-fill"></i>
            </div>

            <h2>Remove Notification?</h2>

            <p>Are you sure you want to remove this notification? This action cannot be undone.</p>

            <div className="notification-modal-preview">
              <i className="bi bi-bell-fill"></i>
              <span>{deleteTitle}</span>
            </div>

            <div className="notification-modal-actions">
              <button type="button" className="notification-cancel-btn" onClick={closeDeleteConfirmation}>
                Cancel
              </button>
              <button type="button" className="notification-confirm-btn" onClick={removeNotification}>
                <i className="bi bi-trash3"></i> Remove
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

  );
}

export default Notifications;
