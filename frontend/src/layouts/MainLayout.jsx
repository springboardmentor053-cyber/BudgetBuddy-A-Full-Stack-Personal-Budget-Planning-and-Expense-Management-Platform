import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MainLayout({ children, pageTitle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the session token
    navigate('/login'); // Send back to login
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '30px', textAlign: 'center' }}>BudgetBuddy 💰</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px', background: '#34495e' }}>📊 Dashboard</Link>
            <Link to="/income" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>💵 Income</Link>
            <Link to="/expenses" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>📉 Expenses</Link>
            <Link to="/budgets" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>📅 Budgets</Link>
            <Link to="/savings" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>💲 Savings Goals</Link>
            <Link to="/notifications" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>🔔 Notifications</Link>
            <Link to="/reports" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>📋 Reports</Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none', padding: '10px', borderRadius: '4px' }}>⚙️ Settings</Link>
          </nav>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }}>
          Logout
        </button>
      </div>

      {/* Main Content Window */}
      <div style={{ flex: 1, backgroundColor: '#f5f6fa', padding: '30px', overflowY: 'auto' }}>
        <header style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>{pageTitle}</h1>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;