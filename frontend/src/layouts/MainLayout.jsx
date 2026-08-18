import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { registerFirebaseForUser, getFirebaseMessagingSupported } from '../services/firebase';

function MainLayout({ children, pageTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const isDark = theme === 'dark';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('selectedAvatarUrl');
    localStorage.removeItem('selectedAvatarId');
    navigate('/login');
  };

  const loadUserProfile = () => {
    const storedUsername = localStorage.getItem('username');
    const storedAvatarUrl = localStorage.getItem('selectedAvatarUrl');

    if (storedUsername) setUsername(storedUsername);
    if (storedAvatarUrl) setAvatarUrl(storedAvatarUrl);

    // Optional API Sync
    api.get('users/user/')
      .then((res) => {
        if (res.data) {
          const userData = res.data;
          const name = userData.username || userData.user?.username;
          if (name) {
            setUsername(name);
            localStorage.setItem('username', name);
          }
        }
      })
      .catch((err) => console.log('API sync skipped/failed:', err));
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const previousIds = new Set(notifications.map((item) => item.id));
      if (Notification.permission === 'granted') {
        list.slice(0, 5).forEach((n) => {
          if (!previousIds.has(n.id) && !n.is_read) {
            new Notification(n.title || 'BudgetBuddy', {
              body: n.message || '',
              icon: '/favicon.svg',
            });
          }
        });
      }
      setNotifications(list.slice(0, 6));
    } catch (err) {
      console.log('Notification refresh skipped/failed:', err);
    }
  };

  useEffect(() => {
    loadUserProfile();
    loadNotifications();

    const handleProfileUpdate = () => loadUserProfile();
    const handleNotificationUpdate = () => loadNotifications();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('notificationsUpdated', handleNotificationUpdate);

    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    const handleThemeChange = () => setTheme(localStorage.getItem('appTheme') || 'light');
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    const registerPush = async () => {
      if (!username) return;
      const supported = await getFirebaseMessagingSupported();
      if (!supported) return;
      try {
        await registerFirebaseForUser();
      } catch (err) {
        console.log('Firebase push registration skipped/failed:', err);
      }
    };
    registerPush().catch(() => {});
  }, [username]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

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
      <div style={{ width: '240px', minWidth: '240px', backgroundColor: isDark ? '#1e293b' : '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', borderRight: `1px solid ${isDark ? '#475569' : 'transparent'}` }}>
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '30px', textAlign: 'center' }}>BudgetBuddy 💰</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/dashboard" style={getLinkStyle('/dashboard')}>📊 Dashboard</Link>
            <Link to="/reports" style={getLinkStyle('/reports')}>📋 Reports</Link>
            <Link to="/income" style={getLinkStyle('/income')}>💵 Income</Link>
            <Link to="/expenses" style={getLinkStyle('/expenses')}>📉 Expenses</Link>
            <Link to="/budgets" style={getLinkStyle('/budgets')}>📅 Budgets</Link>
            <Link to="/savings" style={getLinkStyle('/savings')}>💲 Savings Goals</Link>
            <Link to="/settings" style={getLinkStyle('/settings')}>⚙️ Settings</Link>
          </nav>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: 'auto' }}>
          Logout
        </button>
      </div>

      {/* Main Content Window */}
      <div style={{ flex: 1, minWidth: 0, backgroundColor: isDark ? '#111827' : '#f5f6fa', padding: '30px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {/* Header with Welcome Greeting & Profile Dropdown */}
        <header style={{ 
          borderBottom: `1px solid ${isDark ? '#334155' : '#e1e4e8'}`, 
          paddingBottom: '15px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <h1 style={{ margin: 0, color: isDark ? '#f8fafc' : '#2c3e50', fontSize: '1.8rem' }}>{pageTitle}</h1>
          </div>
          
          {/* Interactive Profile Pill Container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  if (!notificationsOpen) loadNotifications();
                }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: `1px solid ${isDark ? '#475569' : '#e1e8ed'}`,
                  background: isDark ? '#1f2937' : 'white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  color: isDark ? '#f8fafc' : '#34495e',
                  fontSize: '1.1rem'
                }}
                aria-label="Notifications"
              >
                🔔
              </button>

              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '340px',
                  maxWidth: '85vw',
                  background: isDark ? '#1f2937' : '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.16)',
                  border: `1px solid ${isDark ? '#475569' : '#e1e8ed'}`,
                  zIndex: 1200,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: `1px solid ${isDark ? '#475569' : '#f1f5f9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: isDark ? '#f8fafc' : '#102a43' }}>Notifications</strong>
                    <Link to="/notifications" onClick={() => setNotificationsOpen(false)} style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>View all</Link>
                  </div>
                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '18px', color: '#94a3b8', fontSize: '0.9rem' }}>No notifications yet.</div>
                    ) : notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          try {
                            if (!n.is_read) await api.patch(`notifications/${n.id}/read/`);
                            setNotificationsOpen(false);
                            await loadNotifications();
                          } catch (err) {
                            console.log(err);
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: 'none',
                          borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                          background: n.is_read ? (isDark ? '#111827' : '#fff') : (isDark ? '#0f172a' : '#f8fafc'),
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'start' }}>
                          <div>
                            <div style={{ color: isDark ? '#f8fafc' : '#102a43', fontWeight: 700, fontSize: '0.92rem' }}>{n.title}</div>
                            <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px' }}>{n.message}</div>
                          </div>
                          {!n.is_read && <span style={{ width: '9px', height: '9px', background: '#38b6ff', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: isDark ? '#1f2937' : 'white', 
                padding: '6px 12px 6px 16px', 
                borderRadius: '25px', 
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                border: `1px solid ${isDark ? '#475569' : '#e1e8ed'}`,
                fontSize: '0.95rem',
                color: isDark ? '#f8fafc' : '#34495e',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👋 Welcome, <span style={{ color: '#3498db' }}>{username || 'anagha'}</span>!</span>

              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid #3498db',
                    backgroundColor: '#1a252f'
                  }} 
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3498db',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {username ? username.charAt(0).toUpperCase() : 'A'}
                </div>
              )}

              <span style={{ fontSize: '0.75rem', color: '#95a5a6' }}>{dropdownOpen ? '▲' : '▼'}</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '180px',
                background: isDark ? '#1f2937' : '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: `1px solid ${isDark ? '#475569' : '#e1e8ed'}`,
                padding: '8px 0',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '8px 16px', borderBottom: `1px solid ${isDark ? '#475569' : '#f1f5f9'}`, marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: isDark ? '#f8fafc' : '#2c3e50' }}>{username || 'anagha'}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#95a5a6' }}>User Account</p>
                </div>

                <Link 
                  to="/settings" 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    padding: '10px 16px',
                    textDecoration: 'none',
                    color: isDark ? '#e2e8f0' : '#34495e',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = isDark ? '#334155' : '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  ⚙️ Settings
                </Link>

                <button 
                  onClick={handleLogout}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#e74c3c',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  🚪 Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        <main data-page={location.pathname.slice(1) || 'home'} style={{ width: '100%' }}>{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
