import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread-count/');
      if (response.data && typeof response.data.unread_count === 'number') {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      // Fallback to fetching notification list
      try {
        const listRes = await api.get('/api/notifications/');
        if (Array.isArray(listRes.data)) {
          const unread = listRes.data.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        console.error('Failed to fetch unread notification count:', e);
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const handleNotificationUpdated = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notification-updated', handleNotificationUpdated);
    return () => {
      window.removeEventListener('notification-updated', handleNotificationUpdated);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="layout-sidebar">
        <div>
          <h2 className="sidebar-logo">BudgetBuddy</h2>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/expenses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Expenses
            </NavLink>
            <NavLink to="/income" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Income
            </NavLink>
            <NavLink to="/budgets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Budgets
            </NavLink>
            <NavLink to="/savings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Savings
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Notifications
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Analytics
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Reports
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Settings
            </NavLink>
          </nav>
        </div>
        <button onClick={handleLogout} className="btn btn-danger w-full mt-6">
          Logout
        </button>
      </aside>

      {/* Main Container with Sticky Top Header */}
      <div className="layout-main-container">
        <header className="app-top-header">
          <button
            onClick={() => navigate('/notifications')}
            className="bell-notification-btn"
            title="Notifications"
            aria-label="Notifications"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="layout-content" style={{ marginLeft: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
