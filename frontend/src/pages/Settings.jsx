import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

export const AVATAR_OPTIONS = [
  { id: 'avatar1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { id: 'avatar2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
  { id: 'avatar3', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Buddy' },
  { id: 'avatar4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe' },
  { id: 'avatar5', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy' },
  { id: 'avatar6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
  { id: 'avatar7', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spark' },
  { id: 'avatar8', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool' },
  { id: 'avatar9', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maya' },
  { id: 'avatar10', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anagha' },
  { id: 'avatar11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
  { id: 'avatar12', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'avatar13', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber' },
  { id: 'avatar14', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Willow' },
  { id: 'avatar15', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star' },
  { id: 'avatar16', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Elena' },
  { id: 'avatar17', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 'avatar18', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo' },
  { id: 'avatar19', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nova' },
  { id: 'avatar20', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Silly' },
  { id: 'avatar21', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Chloe' },
  { id: 'avatar22', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' },
  { id: 'avatar23', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel' },
  { id: 'avatar24', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper' },
];

function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile State
  const [username, setUsername] = useState(localStorage.getItem('username') || 'anagha');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'anagha@example.com');

  const savedAvatarId = localStorage.getItem('selectedAvatarId');
  const initialAvatar = AVATAR_OPTIONS.find(a => a.id === savedAvatarId) || AVATAR_OPTIONS[1];
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);

  const [tempUsername, setTempUsername] = useState(username);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempAvatar, setTempAvatar] = useState(selectedAvatar);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Define explicit theme colors with high contrast guarantees
  const themeStyles = {
    dark: {
      cardBg: '#243342',
      subtleBg: '#1a252f',
      inputBg: '#1a252f',
      textMain: '#ffffff',
      textMuted: '#bdc3c7',
      textSub: '#8899a6',
      border: 'rgba(255, 255, 255, 0.08)',
      inputBorder: 'rgba(255, 255, 255, 0.15)',
      cardShadow: '0 10px 30px rgba(0,0,0,0.35)'
    },
    light: {
      cardBg: '#ffffff',
      subtleBg: '#f8fafc',
      inputBg: '#ffffff',
      textMain: '#0f172a',
      textMuted: '#475569',
      textSub: '#64748b',
      border: '#e2e8f0',
      inputBorder: '#cbd5e1',
      cardShadow: '0 4px 20px rgba(0,0,0,0.06)'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.dark;

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new Event('themeChanged'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const fetchUserData = async () => {
      try {
        const response = await api.get('users/user/');
        if (response.data) {
          if (response.data.username) setUsername(response.data.username);
          if (response.data.email) setEmail(response.data.email);
          if (response.data.avatar) {
            const foundAvatar = AVATAR_OPTIONS.find(a => a.id === response.data.avatar);
            if (foundAvatar) setSelectedAvatar(foundAvatar);
          }
        }
      } catch (err) {
        // Quiet fallback
      }
    };
    fetchUserData();
  }, [theme]);

  const handleStartEditProfile = () => {
    setTempUsername(username);
    setTempEmail(email);
    setTempAvatar(selectedAvatar);
    setIsEditingProfile(true);
    setProfileMsg({ type: '', text: '' });
  };

  const handleCancelEditProfile = () => {
    setTempUsername(username);
    setTempEmail(email);
    setTempAvatar(selectedAvatar);
    setIsEditingProfile(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch('users/user/', {
        username: tempUsername,
        email: tempEmail,
        avatar: tempAvatar.id,
      });
    } catch (err) {
      // Fallback
    }

    setUsername(tempUsername);
    setEmail(tempEmail);
    setSelectedAvatar(tempAvatar);

    localStorage.setItem('username', tempUsername);
    localStorage.setItem('email', tempEmail);
    localStorage.setItem('selectedAvatarUrl', tempAvatar.url);
    localStorage.setItem('selectedAvatarId', tempAvatar.id);

    window.dispatchEvent(new Event('profileUpdated'));

    setIsEditingProfile(false);
    setProfileMsg({ type: 'success', text: 'Profile updated successfully! ✨' });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    try {
      await api.post('users/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully! 🔐' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    }

    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const cardStyle = {
    background: currentTheme.cardBg,
    padding: '28px',
    borderRadius: '16px',
    boxShadow: currentTheme.cardShadow,
    border: `1px solid ${currentTheme.border}`,
    transition: 'all 0.2s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${currentTheme.inputBorder}`,
    background: currentTheme.inputBg,
    color: currentTheme.textMain,
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <MainLayout pageTitle="Settings ⚙️">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '950px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Appearance / Theme Toggle Card */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '700', color: currentTheme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎨 Appearance & Theme
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, color: currentTheme.textMain, fontSize: '1rem', fontWeight: '600' }}>Theme Mode</h4>
              <p style={{ margin: '4px 0 0 0', color: currentTheme.textMuted, fontSize: '0.85rem' }}>Switch between Light and Dark interface modes.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', background: currentTheme.subtleBg, padding: '4px', borderRadius: '10px', border: `1px solid ${currentTheme.border}` }}>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: theme === 'light' ? '#3498db' : 'transparent',
                  color: theme === 'light' ? '#ffffff' : currentTheme.textMuted,
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: theme === 'dark' ? '#3498db' : 'transparent',
                  color: theme === 'dark' ? '#ffffff' : currentTheme.textMuted,
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: currentTheme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
              👤 Profile & Avatar
            </h3>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={handleStartEditProfile}
                style={{ padding: '9px 18px', background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid #3498db', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {profileMsg.text && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.88rem', fontWeight: '600', background: profileMsg.type === 'success' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)', border: `1px solid ${profileMsg.type === 'success' ? '#2ecc71' : '#e74c3c'}`, color: profileMsg.type === 'success' ? '#2ecc71' : '#e74c3c' }}>
              {profileMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: `1px solid ${currentTheme.border}` }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: currentTheme.subtleBg, border: '3px solid #3498db', padding: '4px', overflow: 'hidden' }}>
              <img 
                src={(isEditingProfile ? tempAvatar : selectedAvatar).url} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: currentTheme.textMain }}>{username}</h4>
              <p style={{ margin: '4px 0 0 0', color: currentTheme.textMuted, fontSize: '0.9rem' }}>{email}</p>
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.88rem', fontWeight: '700', color: '#3498db' }}>
                  Select Avatar Picture ({AVATAR_OPTIONS.length} Available)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '12px', maxHeight: '220px', overflowY: 'auto', padding: '8px', background: currentTheme.subtleBg, borderRadius: '12px', border: `1px solid ${currentTheme.border}` }}>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      type="button"
                      key={avatar.id}
                      aria-label={`Select ${avatar.id}`}
                      onClick={() => setTempAvatar(avatar)}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: currentTheme.cardBg,
                        border: tempAvatar.id === avatar.id ? '3px solid #3498db' : `2px solid ${currentTheme.border}`,
                        cursor: 'pointer',
                        padding: '4px',
                        transform: tempAvatar.id === avatar.id ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      <img src={avatar.url} alt={`Avatar Preset ${avatar.id}`} style={{ width: '100%', height: '100%' }} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: currentTheme.textMuted }}>Username</label>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: currentTheme.textMuted }}>Email Address</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer' }}>
                  Save Changes
                </button>
                <button type="button" onClick={handleCancelEditProfile} style={{ padding: '10px 20px', background: 'transparent', color: currentTheme.textMuted, border: `1px solid ${currentTheme.border}`, borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: currentTheme.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem', fontWeight: '700', color: currentTheme.textMain }}>{username}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: currentTheme.textSub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem', fontWeight: '700', color: currentTheme.textMain }}>{email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Password Security Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditingPassword ? '20px' : '0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: currentTheme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔒 Password & Security
            </h3>
            {!isEditingPassword && (
              <button
                type="button"
                onClick={() => { setIsEditingPassword(true); setPasswordMsg({ type: '', text: '' }); }}
                style={{ padding: '9px 18px', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid #2ecc71', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer' }}
              >
                🔑 Change Password
              </button>
            )}
          </div>

          {passwordMsg.text && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.88rem', fontWeight: '600', background: passwordMsg.type === 'success' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)', border: `1px solid ${passwordMsg.type === 'success' ? '#2ecc71' : '#e74c3c'}`, color: passwordMsg.type === 'success' ? '#2ecc71' : '#e74c3c' }}>
              {passwordMsg.text}
            </div>
          )}

          {isEditingPassword && (
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: currentTheme.textMuted }}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: currentTheme.textMuted }}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: currentTheme.textMuted }}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer' }}>Update Password</button>
                <button type="button" onClick={() => setIsEditingPassword(false)} style={{ padding: '10px 20px', background: 'transparent', color: currentTheme.textMuted, border: `1px solid ${currentTheme.border}`, borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Notifications Preference Card */}
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700', color: currentTheme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>🔔 Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: `1px solid ${currentTheme.border}` }}>
              <div>
                <h4 style={{ margin: 0, color: currentTheme.textMain, fontSize: '1rem', fontWeight: '600' }}>Email Alerts</h4>
                <p style={{ margin: '4px 0 0 0', color: currentTheme.textMuted, fontSize: '0.85rem' }}>Receive email notifications for important budget updates and security.</p>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3498db' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: `1px solid ${currentTheme.border}` }}>
              <div>
                <h4 style={{ margin: 0, color: currentTheme.textMain, fontSize: '1rem', fontWeight: '600' }}>Push Notifications</h4>
                <p style={{ margin: '4px 0 0 0', color: currentTheme.textMuted, fontSize: '0.85rem' }}>Show real-time alert pop-ups inside BudgetBuddy when logging transactions.</p>
              </div>
              <input type="checkbox" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3498db' }} />
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default Settings;
