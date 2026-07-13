import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();

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
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/expenses" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Expenses</NavLink>
            <NavLink to="/income" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Income</NavLink>
            <NavLink to="/budgets" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Budgets</NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Reports</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Settings</NavLink>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-danger w-full mt-6"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
