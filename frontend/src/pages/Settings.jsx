import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

// Expanded high-quality illustrated avatar presets (DiceBear API)
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile State
  const [username, setUsername] = useState(localStorage.getItem('username') || 'anagha');
  const [email, setEmail] = useState(localStorage.getItem('email') || 'anagha@example.com');

  // Sync selected avatar with localStorage
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
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Fetch initial profile data from API on component mount
  useEffect(() => {
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
        // Quietly failover to existing state / localStorage values
      }
    };
    fetchUserData();
  }, []);

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
      // Direct UI update fallback if backend request fails/offline
    }

    setUsername(tempUsername);
    setEmail(tempEmail);
    setSelectedAvatar(tempAvatar);

    // Persist to localStorage
    localStorage.setItem('username', tempUsername);
    localStorage.setItem('email', tempEmail);
    localStorage.setItem('selectedAvatarUrl', tempAvatar.url);
    localStorage.setItem('selectedAvatarId', tempAvatar.id);

    // Broadcast update event
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

  return (
    <MainLayout pageTitle="Settings ⚙️">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '950px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Profile Card */}
        <div style={{ background: '#243342', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              👤 Profile & Avatar
            </h3>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={handleStartEditProfile}
                style={{ padding: '9px 18px', background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid #3498db', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
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

          {/* Active Profile Banner Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1a252f', border: '3px solid #3498db', padding: '4px', boxShadow: '0 0 15px rgba(52, 152, 219, 0.4)', overflow: 'hidden' }}>
              <img 
                src={(isEditingProfile ? tempAvatar : selectedAvatar).url} 
                alt="Profile Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>{username}</h4>
              <p style={{ margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '0.9rem' }}>{email}</p>
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Avatar Selector Grid */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.88rem', fontWeight: '700', color: '#3498db' }}>
                  Select Avatar Picture ({AVATAR_OPTIONS.length} Available)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '12px', maxHeight: '220px', overflowY: 'auto', padding: '8px', background: '#1a252f', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                        background: '#243342',
                        border: tempAvatar.id === avatar.id ? '3px solid #3498db' : '2px solid rgba(255,255,255,0.1)',
                        boxShadow: tempAvatar.id === avatar.id ? '0 0 12px rgba(52, 152, 219, 0.6)' : 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.15s ease',
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#bdc3c7' }}>Username</label>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#1a252f', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#bdc3c7' }}>Email Address</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#1a252f', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)' }}>
                  Save Changes
                </button>
                <button type="button" onClick={handleCancelEditProfile} style={{ padding: '10px 20px', background: 'transparent', color: '#bdc3c7', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#8899a6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{username}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#8899a6', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Password Security Card */}
        <div style={{ background: '#243342', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditingPassword ? '20px' : '0' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#bdc3c7' }}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#1a252f', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#bdc3c7' }}>New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#1a252f', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#bdc3c7' }}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', background: '#1a252f', color: 'white', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '10px 24px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)' }}>Update Password</button>
                <button type="button" onClick={() => setIsEditingPassword(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#bdc3c7', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Notifications Preference Card */}
        <div style={{ background: '#243342', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>🔔 Notifications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: '600' }}>Email Alerts</h4>
                <p style={{ margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '0.85rem' }}>Receive email notifications for important budget updates and security.</p>
              </div>
              <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3498db' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: '600' }}>Push Notifications</h4>
                <p style={{ margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '0.85rem' }}>Show real-time alert pop-ups inside BudgetBuddy when logging transactions.</p>
              </div>
              <input type="checkbox" checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3498db' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: '600' }}>Weekly Summary</h4>
                <p style={{ margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '0.85rem' }}>Get a weekly summary breakdown of your spending habits and progress.</p>
              </div>
              <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3498db' }} />
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

export default Settings;
