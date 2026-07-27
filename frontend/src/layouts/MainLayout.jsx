import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; // Adjust path if your api service is elsewhere

function MainLayout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  // Fetch current user details or retrieve from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Fallback: Fetch user profile directly from API if endpoints exist
      api.get('user/profile/') // Or your custom user endpoint e.g., 'auth/user/'
        .then((res) => {
          if (res.data?.username) {
            setUsername(res.data.username);
            localStorage.setItem('username', res.data.username);
          }
        })
        .catch((err) => console.log('User profile fetch skipped/failed:', err));
    }
  }, []);

  // Helper function to dynamically check if link is active
  const isActive = (path) => location.pathname === path;

  // Dynamic styling for active sidebar links
  const getLinkStyle = (path) => ({
    color: 'white',
    textDecoration: 'none',
    padding: '10px 14px',
    borderRadius: '6px',
    background: isActive(path) ? '#34495e' : 'transparent',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
    display: 'block'
  });

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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/dashboard" style={getLinkStyle('/dashboard')}>📊 Dashboard</Link>
            <Link to="/income" style={getLinkStyle('/income')}>💵 Income</Link>
            <Link to="/expenses" style={getLinkStyle('/expenses')}>📉 Expenses</Link>
            <Link to="/budgets" style={getLinkStyle('/budgets')}>📅 Budgets</Link>
            <Link to="/savings" style={getLinkStyle('/savings')}>💲 Savings Goals</Link>
            <Link to="/notifications" style={getLinkStyle('/notifications')}>🔔 Notifications</Link>
            <Link to="/reports" style={getLinkStyle('/reports')}>📋 Reports</Link>
            <Link to="/settings" style={getLinkStyle('/settings')}>⚙️ Settings</Link>
          </nav>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }}>
          Logout
        </button>
      </div>

      {/* Main Content Window */}
      <div style={{ flex: 1, minWidth: 0, backgroundColor: '#f5f6fa', padding: '30px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {/* Header with Welcome Greeting */}
        <header style={{ 
          borderBottom: '1px solid #e1e4e8', 
          paddingBottom: '15px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem' }}>{pageTitle}</h1>
          </div>
          
          {/* Welcome User Badge */}
          <div style={{ 
            background: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e1e8ed',
            fontSize: '0.95rem',
            color: '#34495e',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>👋</span>
            <span>Welcome, <span style={{ color: '#3498db' }}>{username || 'User'}</span>!</span>
          </div>
        </header>

        <main style={{ width: '100%' }}>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;