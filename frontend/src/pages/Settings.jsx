import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Settings = () => {
  const navigate = useNavigate();

  // Dynamic user profile state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  // Edit Profile mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('budgetbuddy_theme') || 'light';
  });

  // Notification Preferences State
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('budgetbuddy_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      inAppAlerts: true,
      emailAlerts: true,
    };
  });
  const [notifMessage, setNotifMessage] = useState('');

  // Synchronize Theme on Mount & Change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('budgetbuddy_theme', theme);
  }, [theme]);

  // Resolve email for a given username dynamically from localStorage or default pattern
  const resolveEmailForUsername = (uname) => {
    if (!uname) return '';
    const cleanName = uname.trim();

    // 1. Check saved user profile in localStorage
    const profileSaved = localStorage.getItem('budgetbuddy_user_profile');
    if (profileSaved) {
      try {
        const parsed = JSON.parse(profileSaved);
        if (parsed.username && parsed.username.toLowerCase() === cleanName.toLowerCase() && parsed.email) {
          return parsed.email;
        }
      } catch (e) {}
    }

    // 2. Check key variations in localStorage
    const emailKeys = [
      `email_${cleanName}`,
      `email_${cleanName.toLowerCase()}`,
      `email`,
      `user_email`,
      `registered_email`
    ];

    for (const key of emailKeys) {
      const val = localStorage.getItem(key);
      if (val && typeof val === 'string' && val.includes('@')) {
        return val;
      }
    }

    // 3. Fallback: Generate dynamic email matching the username format
    return `${cleanName.toLowerCase()}@gmail.com`;
  };

  // Load actual authenticated user profile on mount
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      let detectedUsername = '';
      let detectedEmail = '';

      // Fetch authenticated user profile directly from backend /api/user/profile/
      try {
        const res = await api.get('/api/user/profile/');
        if (res.data) {
          if (res.data.username) detectedUsername = res.data.username;
          if (res.data.email) detectedEmail = res.data.email;
        }
      } catch (err) {
        console.error('Could not fetch user profile from /api/user/profile/', err);
      }

      // Fallback check JWT token payload or localStorage if needed
      if (!detectedUsername || !detectedEmail) {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              if (!detectedUsername && payload.username) detectedUsername = payload.username;
              if (!detectedEmail && payload.email) detectedEmail = payload.email;
            }
          } catch (e) {}
        }
      }

      if (!detectedUsername) {
        detectedUsername = localStorage.getItem('username') || 'User';
      }

      if (!detectedEmail) {
        detectedEmail = resolveEmailForUsername(detectedUsername);
      }

      if (isMounted) {
        setUsername(detectedUsername);
        setEmail(detectedEmail);
        setEditUsername(detectedUsername);
        setEditEmail(detectedEmail);
        setLoadingUser(false);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUsername = editUsername.trim() || username;
    const updatedEmail = editEmail.trim() || email;

    setUsername(updatedUsername);
    setEmail(updatedEmail);

    const updatedProfile = {
      username: updatedUsername,
      email: updatedEmail,
    };
    localStorage.setItem('budgetbuddy_user_profile', JSON.stringify(updatedProfile));
    localStorage.setItem(`email_${updatedUsername}`, updatedEmail);
    localStorage.setItem('username', updatedUsername);
    localStorage.setItem('email', updatedEmail);

    setIsEditingProfile(false);
    setProfileMessage('Profile display preferences updated locally.');
    setTimeout(() => setProfileMessage(''), 4000);
  };

  // Handle Theme Toggle
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  // Handle Notification Toggle
  const handleNotifToggle = (key) => {
    const updated = {
      ...notifSettings,
      [key]: !notifSettings[key],
    };
    setNotifSettings(updated);
    localStorage.setItem('budgetbuddy_notification_settings', JSON.stringify(updated));
    setNotifMessage('Notification preferences updated locally.');
    setTimeout(() => setNotifMessage(''), 3000);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences, appearance, and application settings.</p>
      </header>

      <div className="grid-12" style={{ rowGap: 'var(--space-6)' }}>
        {/* 1. PROFILE / ACCOUNT SECTION */}
        <div style={{ gridColumn: 'span 12' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <i className="fas fa-user-circle" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
                <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Profile / Account</h2>
              </div>
              {!isEditingProfile && !loadingUser && (
                <button
                  onClick={() => {
                    setEditUsername(username);
                    setEditEmail(email);
                    setIsEditingProfile(true);
                  }}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-edit" style={{ marginRight: '6px' }}></i> Edit Profile
                </button>
              )}
            </div>

            {profileMessage && (
              <div className="alert alert-success mb-4" style={{ padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
                <i className="fas fa-check-circle"></i>
                <span>{profileMessage}</span>
              </div>
            )}

            {loadingUser ? (
              <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                Loading account information...
              </div>
            ) : !isEditingProfile ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Username</span>
                  <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{username}</strong>
                </div>
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</span>
                  <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{email}</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--info-light)', color: 'var(--info)', borderRadius: 'var(--radius-base)', fontSize: 'var(--text-xs)' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '6px' }}></i>
                  Note: Updating these fields updates your local profile display preferences.
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-username">Username</label>
                  <input
                    id="edit-username"
                    type="text"
                    className="input-field"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-email">Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="input-field"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save" style={{ marginRight: '6px' }}></i> Save Local Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 2. APPEARANCE SECTION */}
        <div style={{ gridColumn: 'span 12' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <i className="fas fa-palette" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Appearance</h2>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Choose your preferred color theme for BudgetBuddy interface.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {/* Light Mode Option Card */}
              <div
                onClick={() => handleThemeChange('light')}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  border: theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'light' ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-sun" style={{ color: '#F59E0B', fontSize: '1.25rem' }}></i>
                    <strong style={{ fontSize: 'var(--text-base)' }}>Light Mode</strong>
                  </div>
                  {theme === 'light' && (
                    <span className="badge badge-success">
                      <i className="fas fa-check" style={{ marginRight: '4px' }}></i> Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: '#4B5563', margin: 0 }}>
                  Clean bright theme with light backgrounds and high contrast readability.
                </p>
              </div>

              {/* Dark Mode Option Card */}
              <div
                onClick={() => handleThemeChange('dark')}
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  border: theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'dark' ? '0 0 0 3px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-moon" style={{ color: '#3B82F6', fontSize: '1.25rem' }}></i>
                    <strong style={{ fontSize: 'var(--text-base)' }}>Dark Mode</strong>
                  </div>
                  {theme === 'dark' && (
                    <span className="badge badge-success">
                      <i className="fas fa-check" style={{ marginRight: '4px' }}></i> Active
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: '#94A3B8', margin: 0 }}>
                  Sleek dark theme optimized for low-light environments and eye comfort.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. NOTIFICATIONS SECTION */}
        <div style={{ gridColumn: 'span 12' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <i className="fas fa-bell" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Notification Preferences</h2>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Customize your alert preferences for budget limits and notifications.</span>
              </div>
            </div>

            {notifMessage && (
              <div className="alert alert-info mb-4" style={{ padding: '8px 12px', fontSize: 'var(--text-sm)' }}>
                <i className="fas fa-info-circle"></i>
                <span>{notifMessage}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
              {/* Option 1: In-App Budget Alerts */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-base)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
                    In-App Budget Alerts
                  </strong>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Receive notification highlights when category spending exceeds budget thresholds.
                  </span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifSettings.inAppAlerts}
                    onChange={() => handleNotifToggle('inAppAlerts')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: notifSettings.inAppAlerts ? 'var(--primary)' : 'var(--text-muted)',
                      transition: '0.2s',
                      borderRadius: '24px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px', width: '18px',
                        left: notifSettings.inAppAlerts ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    ></span>
                  </span>
                </label>
              </div>

              {/* Option 2: Email Budget Alerts */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-base)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
                    Email Budget Alerts
                  </strong>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Receive summary email notifications when budget limits are reached.
                  </span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailAlerts}
                    onChange={() => handleNotifToggle('emailAlerts')}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: notifSettings.emailAlerts ? 'var(--primary)' : 'var(--text-muted)',
                      transition: '0.2s',
                      borderRadius: '24px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px', width: '18px',
                        left: notifSettings.emailAlerts ? '24px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.2s',
                        borderRadius: '50%',
                      }}
                    ></span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SECURITY / SESSION SECTION */}
        <div style={{ gridColumn: 'span 12' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}></i>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>Security & Session</h2>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Overview of your authentication status and active session.</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Authentication Status</span>
                <span className="badge badge-success">
                  <i className="fas fa-shield-check" style={{ marginRight: '4px' }}></i> Authentication: Active
                </span>
              </div>

              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Session Security</span>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>JWT Bearer Token Encrypted</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>Sign Out</strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>End your current session safely and return to the login page.</span>
              </div>
              <button onClick={handleLogout} className="btn btn-danger">
                <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
