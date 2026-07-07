import { useState } from "react";
import {
  FaMoon,
  FaBell,
  FaLock,
  FaGlobe,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaSave,
} from "react-icons/fa";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      {/* Header */}

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Customize your BudgetBuddy experience.
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Appearance */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaMoon className="text-cyan-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Appearance
            </h2>

          </div>

          <div className="flex justify-between items-center">

            <span>Dark Mode</span>

            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="w-5 h-5 accent-cyan-400"
            />

          </div>

        </div>

        {/* Notifications */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaBell className="text-yellow-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Notifications
            </h2>

          </div>

          <div className="flex justify-between items-center">

            <span>Enable Notifications</span>

            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-5 h-5 accent-cyan-400"
            />

          </div>

        </div>

        {/* Currency */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaMoneyBillWave className="text-green-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Currency
            </h2>

          </div>

          <select className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 focus:outline-none">
            <option>Indian Rupee (₹)</option>
            <option>US Dollar ($)</option>
            <option>Euro (€)</option>
            <option>Pound (£)</option>
          </select>

        </div>

        {/* Language */}

        <div className="bg-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FaGlobe className="text-cyan-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Language
            </h2>

          </div>

          <select className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 focus:outline-none">
            <option>English</option>
            <option>Hindi</option>
            <option>Telugu</option>
          </select>

        </div>

        {/* Password */}

        <div className="bg-slate-800 rounded-2xl p-6 lg:col-span-2">

          <div className="flex items-center gap-3 mb-6">

            <FaLock className="text-red-400 text-2xl" />

            <h2 className="text-2xl font-semibold">
              Security
            </h2>

          </div>

          <button className="bg-red-500 hover:bg-red-400 px-6 py-3 rounded-xl font-semibold">
            Change Password
          </button>

        </div>

      </div>

      {/* Bottom Buttons */}

      <div className="flex flex-wrap gap-4 mt-10">

        <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2">

          <FaSave />

          Save Changes

        </button>

        <button className="bg-red-500 hover:bg-red-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">

          <FaSignOutAlt />

          Logout

        </button>

      </div>

    </div>
  );
}