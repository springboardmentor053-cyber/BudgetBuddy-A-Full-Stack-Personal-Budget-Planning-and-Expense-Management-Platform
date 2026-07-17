import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function MainLayout({ children, pageTitle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the session token
    navigate('/login'); // Send back to login
  };

  // Automatically blast away any high-level center-aligning container limits
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.width = '100vw';
      rootElement.style.maxWidth = '100vw';
      rootElement.style.margin = '0';
      rootElement.style.padding = '0';
    }
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0, overflowX: 'hidden', fontFamily: 'sans-serif', position: 'absolute', left: 0, top: 0 }}>
      {/* Sidebar */}
      <div style={{ width: '240px', minWidth: '240px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
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
      <div style={{ flex: 1, minWidth: 0, backgroundColor: '#f5f6fa', padding: '30px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <header style={{ borderBottom: '1px solid #e1e4e8', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>{pageTitle}</h1>
        </header>
        <main style={{ width: '100%' }}>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;