import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = localStorage.getItem("access");

  const API = "http://127.0.0.1:8000/api/notifications/";

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {

    if (!token) {
      return;
    }

    try {

      const response = await axios.get(
        API,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setNotifications(data);

    } catch (error) {

      console.error(
        "Navbar Notification Error:",
        error
      );

    }

  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      30000
    );

    return () => clearInterval(interval);

  }, []);

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadNotifications = notifications.filter(
    (notification) =>
      !notification.is_read
  );

  const unreadCount =
    unreadNotifications.length;

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");

  };

  // =========================================================
  // NOTIFICATION CLICK
  // =========================================================

  const handleNotificationClick = () => {

    setShowNotifications(false);

    navigate("/notifications");

  };

  // =========================================================
  // UI
  // =========================================================

  return (

    <header className="topbar">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="navbar-welcome">

        <h2>
          Welcome to BudgetBuddy 👋
        </h2>

        <p>
          Manage your finances smarter.
        </p>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="navbar-actions">


        {/* ===================================================
            NOTIFICATION BELL
        =================================================== */}

        <div className="notification-wrapper">

          <button
            className="notification-button"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            title="Notifications"
          >

            <span className="bell-icon">
              🔔
            </span>

            {unreadCount > 0 && (

              <span className="notification-count">

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (

            <div className="notification-dropdown">


              <div className="notification-dropdown-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <span>
                    {unreadCount} unread
                  </span>

                </div>

              </div>


              {/* =================================================
                  UNREAD NOTIFICATIONS
              ================================================= */}

              {unreadNotifications.length === 0 ? (

                <div className="no-notifications">

                  <div>
                    🎉
                  </div>

                  <p>
                    You're all caught up!
                  </p>

                </div>

              ) : (

                <div className="notification-preview-list">

                  {unreadNotifications
                    .slice(0, 5)
                    .map((notification) => (

                      <div
                        className="notification-preview"
                        key={notification.id}
                        onClick={
                          handleNotificationClick
                        }
                      >

                        <div className="preview-icon">

                          {notification.notification_type ===
                          "BUDGET"
                            ? "💰"
                            : notification.notification_type ===
                              "SAVINGS"
                              ? "🎯"
                              : "🔔"}

                        </div>


                        <div className="preview-content">

                          <strong>
                            {notification.title}
                          </strong>

                          <p>
                            {notification.message}
                          </p>

                        </div>

                      </div>

                    ))}

                </div>

              )}


              {/* =================================================
                  VIEW ALL
              ================================================= */}

              <button
                className="view-all-notifications"
                onClick={
                  handleNotificationClick
                }
              >
                View all notifications →
              </button>

            </div>

          )}

        </div>


        {/* ===================================================
            PROFILE
        =================================================== */}

        <div className="navbar-profile">

          <div className="profile-avatar">
            👤
          </div>

          <div className="profile-info">

            <strong>
              Gayathri
            </strong>

            <span>
              Personal Account
            </span>

          </div>

        </div>


        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          className="navbar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          🚪
        </button>

      </div>

    </header>

  );

}

export default Navbar;