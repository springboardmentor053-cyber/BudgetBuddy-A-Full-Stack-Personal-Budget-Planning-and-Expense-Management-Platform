import React, { useEffect, useState } from 'react';
import { changePassword, getUserProfile, updateUserProfile } from '../services/userService';

function PasswordVisibilityIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.4A10.8 10.8 0 0 1 12 5.25c6.75 0 9.75 6.75 9.75 6.75a18.5 18.5 0 0 1-3.15 4.1M6.15 6.15C3.75 8.1 2.25 12 2.25 12S5.25 18.75 12 18.75c1.15 0 2.2-.2 3.15-.55" />
    </svg>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    date_joined: '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState({ type: '', text: '' });
  const [passStatus, setPassStatus] = useState({ type: '', text: '' });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setProfile(data);
        localStorage.setItem('budgetbuddy_username', data.username);
        setLoading(false);
      })
      .catch((err) => {
        setProfileStatus({ type: 'error', text: err.message });
        setLoading(false);
      });
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: '', text: '' });
    try {
      await updateUserProfile({
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      setProfileStatus({ type: 'success', text: 'Profile details saved successfully.' });
    } catch {
      setProfileStatus({ type: 'error', text: 'Unable to update profile. Please verify your details.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassStatus({ type: '', text: '' });

    if (passwords.new_password !== passwords.confirm_new_password) {
      setPassStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      await changePassword(passwords);
      setPassStatus({ type: 'success', text: 'Password changed successfully.' });
      setPasswords({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPassStatus({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 font-medium">Loading user settings...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-5 sm:p-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl shadow-black/10 backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Account centre</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{profile.username}</h1>
            <p className="mt-2 text-sm text-slate-400">Manage your profile information and account security.</p>
          </div>
          {profile.role && <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold capitalize text-cyan-300">{profile.role.replace('_', ' ')}</span>}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">Personal Details</h2>
        <p className="mb-5 text-sm text-slate-400">Keep your account information current.</p>

        {profileStatus.text && (
          <div className={`mb-4 rounded-xl border p-3 text-sm ${profileStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
            {profileStatus.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
              <input
                type="text"
                value={profile.username || ''}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
              <input
                type="text"
                value={profile.role || ''}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-2.5 text-sm capitalize text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email || ''}
              onChange={handleProfileChange}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name || ''}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name || ''}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Save Profile
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl shadow-black/10 backdrop-blur sm:p-6">
        <h2 className="mb-1 text-lg font-semibold text-white">Change Password</h2>
        <p className="mb-5 text-sm text-slate-400">Choose a strong password with at least eight characters.</p>

        {passStatus.text && (
          <div className={`mb-4 rounded-xl border p-3 text-sm ${passStatus.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
            {passStatus.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
            <div className="relative">
              <input type={showOldPass ? 'text' : 'password'} name="old_password" value={passwords.old_password} onChange={handlePasswordChange} required autoComplete="current-password" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-12 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <button type="button" onClick={() => setShowOldPass((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-500 transition hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label={showOldPass ? 'Hide current password' : 'Show current password'} aria-pressed={showOldPass}><PasswordVisibilityIcon visible={showOldPass} /></button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
            <div className="relative">
              <input type={showNewPass ? 'text' : 'password'} name="new_password" value={passwords.new_password} onChange={handlePasswordChange} required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-12 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <button type="button" onClick={() => setShowNewPass((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-500 transition hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label={showNewPass ? 'Hide new password' : 'Show new password'} aria-pressed={showNewPass}><PasswordVisibilityIcon visible={showNewPass} /></button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirmPass ? 'text' : 'password'} name="confirm_new_password" value={passwords.confirm_new_password} onChange={handlePasswordChange} required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-12 text-sm text-slate-100 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              <button type="button" onClick={() => setShowConfirmPass((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-500 transition hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" aria-label={showConfirmPass ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmPass}><PasswordVisibilityIcon visible={showConfirmPass} /></button>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Update Password
          </button>
        </form>
      </section>
      </div>
    </div>
  );
}
