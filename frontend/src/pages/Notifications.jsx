import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const token = localStorage.getItem("access");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // -----------------------------
  // Fetch Notifications
  // -----------------------------

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

  // -----------------------------
  // Open Delete Confirmation
  // -----------------------------

  const openDeleteConfirmation = (notification) => {
    setDeleteId(notification.id);
    setDeleteTitle(notification.title);

    setMessage("");
    setErrorMessage("");
  };

  // -----------------------------
  // Remove Notification
  // -----------------------------

  const removeNotification = async () => {
    if (!deleteId) return;

    setMessage("");
    setErrorMessage("");

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/notifications/${deleteId}/`,
        config
      );

      // Remove immediately from UI
      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) =>
            notification.id !== deleteId
        )
      );

      setDeleteId(null);
      setDeleteTitle("");

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

      setDeleteId(null);
      setDeleteTitle("");

      if (error.response?.data) {
        setErrorMessage(
          JSON.stringify(error.response.data)
        );
      } else {
        setErrorMessage(
          "Unable to remove notification."
        );
      }
    }
  };

  return (
    <div className="container mt-5 mb-5">

      {/* ============================= */}
      {/* Success Message */}
      {/* ============================= */}

      {message && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm"
          role="alert"
        >
          <strong>✅ Success:</strong> {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      {/* ============================= */}
      {/* Error Message */}
      {/* ============================= */}

      {errorMessage && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm"
          role="alert"
        >
          <strong>❌ Error:</strong> {errorMessage}

          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setErrorMessage("")
            }
          ></button>
        </div>
      )}

      {/* ============================= */}
      {/* Page Header */}
      {/* ============================= */}

      <div className="card shadow-lg border-0 bg-primary text-white mb-4">

        <div className="card-body">

          <h2 className="mb-2">
            🔔 Notifications
          </h2>

          <p className="mb-0">
            View and manage your latest financial
            notifications and alerts.
          </p>

        </div>

      </div>

      {/* ============================= */}
      {/* Notifications */}
      {/* ============================= */}

      {notifications.length === 0 ? (

        <div className="alert alert-success shadow-sm">
          <strong>✅ All caught up!</strong>
          <br />
          You have no notifications.
        </div>

      ) : (

        notifications.map((notification) => (

          <div
            key={notification.id}
            className="card shadow mb-3 border-0"
          >

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-start gap-3">

                <div className="flex-grow-1">

                  <h5 className="mb-2">
                    🔔 {notification.title}
                  </h5>

                  <p className="mb-2">
                    {notification.message}
                  </p>

                  <small className="text-muted">
                    📅{" "}
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </small>

                </div>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    openDeleteConfirmation(
                      notification
                    )
                  }
                >
                  🗑️ Remove
                </button>

              </div>

            </div>

          </div>

        ))

      )}

      {/* ============================= */}
      {/* Delete Confirmation Modal */}
      {/* ============================= */}

      {deleteId && (

        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  🗑️ Remove Notification
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteTitle("");
                  }}
                ></button>

              </div>

              <div className="modal-body">

                <p>
                  Are you sure you want to remove
                  this notification?
                </p>

                <div className="alert alert-warning mb-0">

                  <strong>
                    🔔 {deleteTitle}
                  </strong>

                  <br />

                  This notification will be permanently
                  removed.

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteTitle("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={removeNotification}
                >
                  🗑️ Yes, Remove
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Notifications;