import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  /* =========================================================
     APPLY THEME
  ========================================================= */

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  /* =========================================================
     TOGGLE THEME
  ========================================================= */

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");
  };

  /* =========================================================
     FETCH UNREAD NOTIFICATIONS
  ========================================================= */

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const token =
          localStorage.getItem("access");

        if (!token) {
          return;
        }

        const response = await api.get(
          "notifications/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const unread =
          response.data.filter(
            (notification) =>
              !notification.is_read &&
              !notification.is_archived
          ).length;

        setUnreadCount(unread);
      } catch (error) {
        console.error(
          "Error fetching notification count:",
          error
        );
      }
    };

    fetchUnreadNotifications();
  }, []);

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <aside className="sidebar">

      {/* ================= BRAND ================= */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          ₹
        </div>

        <div className="sidebar-brand-text">
          <h2>BudgetBuddy</h2>
          <p>Smart money manager</p>
        </div>

      </div>

      {/* ================= NAVIGATION ================= */}

      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Dashboard"
        >
          <span>🏠</span>
          <span className="nav-text">
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/income"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Income"
        >
          <span>💰</span>
          <span className="nav-text">
            Income
          </span>
        </NavLink>

        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Expenses"
        >
          <span>💳</span>
          <span className="nav-text">
            Expenses
          </span>
        </NavLink>

        <NavLink
          to="/budgets"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Budgets"
        >
          <span>🎯</span>
          <span className="nav-text">
            Budgets
          </span>
        </NavLink>

        <NavLink
          to="/savings-goals"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Savings Goals"
        >
          <span>🏦</span>
          <span className="nav-text">
            Savings Goals
          </span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive
              ? "nav-item active"
              : "nav-item"
          }
          title="Reports"
        >
          <span>📊</span>
          <span className="nav-text">
            Reports
          </span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive
              ? "nav-item active notification-nav-item"
              : "nav-item notification-nav-item"
          }
          title="Notifications"
        >
          <span>🔔</span>

          <span className="nav-text">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span className="sidebar-notification-badge">
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </NavLink>

      </nav>

      {/* ================= BOTTOM ================= */}

      <div className="sidebar-bottom">

        {/* Theme */}

        <button
          type="button"
          className="sidebar-action-button"
          onClick={toggleTheme}
          title={
            theme === "light"
              ? "Dark Mode"
              : "Light Mode"
          }
        >
          <span>
            {theme === "light"
              ? "🌙"
              : "☀️"}
          </span>

          <span className="nav-text">
            {theme === "light"
              ? "Dark Mode"
              : "Light Mode"}
          </span>
        </button>

        {/* Logout */}

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <span>🚪</span>

          <span className="nav-text">
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;