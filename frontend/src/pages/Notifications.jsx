import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/notifications.css";

function Notifications() {

  const [notifications, setNotifications] = useState([]);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const token = localStorage.getItem("access");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        config
      );

      setNotifications(response.data);

    } catch (error) {

      console.error(
        "Error fetching notifications:",
        error
      );

      if (error.response?.status === 401) {

        setErrorMessage(
          "Session expired. Please login again."
        );

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

      } else {

        setErrorMessage(
          "Unable to load notifications."
        );

      }
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

      await axios.delete(
        `http://127.0.0.1:8000/api/notifications/${deleteId}/`,
        config
      );


      setNotifications(
        (previousNotifications) =>
          previousNotifications.filter(
            (notification) =>
              notification.id !== deleteId
          )
      );


      closeDeleteConfirmation();


      setMessage(
        "Notification removed successfully."
      );


      setTimeout(() => {
        setMessage("");
      }, 4000);


    } catch (error) {

      console.error(
        "Error deleting notification:",
        error
      );

      closeDeleteConfirmation();


      if (error.response?.data) {

        setErrorMessage(
          JSON.stringify(
            error.response.data
          )
        );

      } else {

        setErrorMessage(
          "Unable to remove notification."
        );

      }
    }
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    return new Date(date).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  };


  return (

    <div className="notifications-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="notifications-header">

        <div>

          <div className="notifications-eyebrow">
            ACCOUNT
          </div>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with important financial
            alerts and account activity.
          </p>

        </div>


        <div className="notifications-header-icon">

          <i className="bi bi-bell-fill"></i>

        </div>

      </div>


      {/* =================================================
          SUCCESS ALERT
      ================================================= */}

      {message && (

        <div className="notification-alert success">

          <div className="notification-alert-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>

          <div>

            <strong>
              Success
            </strong>

            <p>
              {message}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>

      )}


      {/* =================================================
          ERROR ALERT
      ================================================= */}

      {errorMessage && (

        <div className="notification-alert error">

          <div className="notification-alert-icon">
            <i className="bi bi-exclamation-circle-fill"></i>
          </div>

          <div>

            <strong>
              Error
            </strong>

            <p>
              {errorMessage}
            </p>

          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="notifications-summary">

        <div className="notifications-summary-card">

          <div className="notifications-summary-icon">

            <i className="bi bi-bell-fill"></i>

          </div>

          <div>

            <span>
              TOTAL NOTIFICATIONS
            </span>

            <strong>
              {notifications.length}
            </strong>

            <small>
              Notifications available
            </small>

          </div>

        </div>


        <div className="notifications-summary-card">

          <div className="notifications-summary-icon blue">

            <i className="bi bi-check2-circle"></i>

          </div>

          <div>

            <span>
              ACCOUNT STATUS
            </span>

            <strong>
              Active
            </strong>

            <small>
              Your account is up to date
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="notifications-card">


        {/* CARD HEADER */}

        <div className="notifications-card-header">

          <div>

            <h2>
              Recent Notifications
            </h2>

            <p>
              Your latest financial alerts and updates.
            </p>

          </div>


          <div className="notifications-count">

            {notifications.length}

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {notifications.length === 0 ? (

          <div className="notifications-empty">

            <div className="notifications-empty-icon">

              <i className="bi bi-check2-circle"></i>

            </div>

            <h3>
              You're all caught up!
            </h3>

            <p>
              You don't have any notifications right now.
            </p>

          </div>

        ) : (


          /* =================================================
             NOTIFICATION LIST
          ================================================= */

          <div className="notifications-list">

            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className="notification-item"
                >


                  {/* ICON */}

                  <div className="notification-item-icon">

                    <i className="bi bi-bell-fill"></i>

                  </div>


                  {/* CONTENT */}

                  <div className="notification-item-content">

                    <div className="notification-item-top">

                      <h3>
                        {notification.title}
                      </h3>

                      <span className="notification-badge">
                        ALERT
                      </span>

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <div className="notification-date">

                      <i className="bi bi-clock"></i>

                      {formatDate(
                        notification.created_at
                      )}

                    </div>

                  </div>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="notification-remove-btn"
                    title="Remove notification"
                    onClick={() =>
                      openDeleteConfirmation(
                        notification
                      )
                    }
                  >

                    <i className="bi bi-trash3"></i>

                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteId && (

        <div
          className="notification-modal-overlay"
          onClick={closeDeleteConfirmation}
        >

          <div
            className="notification-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="notification-modal-icon">

              <i className="bi bi-trash3-fill"></i>

            </div>


            <h2>
              Remove Notification?
            </h2>


            <p>
              Are you sure you want to remove
              this notification? This action
              cannot be undone.
            </p>


            <div className="notification-modal-preview">

              <i className="bi bi-bell-fill"></i>

              <span>
                {deleteTitle}
              </span>

            </div>


            <div className="notification-modal-actions">

              <button
                type="button"
                className="notification-cancel-btn"
                onClick={closeDeleteConfirmation}
              >
                Cancel
              </button>


              <button
                type="button"
                className="notification-confirm-btn"
                onClick={removeNotification}
              >
                <i className="bi bi-trash3"></i>{" "}
                Remove
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default Notifications;