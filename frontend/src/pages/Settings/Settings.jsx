import { useState, useEffect } from "react";
import {
  FaMoon,
  FaBell,
  FaLock,
  FaGlobe,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { changePassword } from "../../api/settingsApi";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, saveGlobalSettings } = useSettings();

  // Local Form State
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await saveGlobalSettings(localSettings);
    setSaving(false);
    setSuccessMsg("Settings updated across all pages!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-white">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-4xl font-bold text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Customize your BudgetBuddy experience.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-2xl text-sm font-semibold">
            <FaCheckCircle />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <FaMoon className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold">Appearance</h2>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Dark Mode</span>
            <input
              type="checkbox"
              checked={localSettings.darkMode}
              onChange={(e) => setLocalSettings({ ...localSettings, darkMode: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <FaBell className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold">Notifications</h2>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Enable Notifications</span>
            <input
              type="checkbox"
              checked={localSettings.notifications}
              onChange={(e) => setLocalSettings({ ...localSettings, notifications: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold">Currency</h2>
          </div>

          <select
            value={localSettings.currency}
            onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">Pound (£)</option>
          </select>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <FaGlobe className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold">Language</h2>
          </div>

          <select
            value={localSettings.language}
            onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value })}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              <FaLock className="text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold">Security</h2>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-6 py-3 rounded-2xl font-semibold transition"
          >
            Change Password
          </button>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <FaSave />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>

        <button
          onClick={handleLogout}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="text-2xl font-bold">Change Password</h3>

            {passwordError && <p className="text-xs text-rose-500 bg-rose-500/10 p-3 rounded-xl">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-emerald-500 bg-emerald-500/10 p-3 rounded-xl">{passwordSuccess}</p>}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 text-slate-900 px-5 py-2.5 rounded-2xl font-semibold text-sm"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}