import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaCog,
  FaSearch,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

export default function DashboardNavbar({ setIsOpen, user }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="h-full px-6 flex items-center justify-between" ref={menuRef}>
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition rounded-lg"
            aria-label="Toggle Navigation"
          >
            <FaBars size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              BudgetBuddy
            </h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="hidden lg:flex items-center w-[400px] relative">
          <FaSearch className="absolute left-4 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search transactions, budgets, goals..."
            className="w-full pl-11 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm shadow-sm"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setOpenNotifications(!openNotifications);
                setOpenMenu(false);
              }}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition rounded-xl relative"
            >
              <FaBell size={18} />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>

            {openNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-64 overflow-y-auto">
                  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Budget Warning</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You used 85% of your Food budget.</p>
                  </div>
                  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Goal Milestone</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Savings goal 'Vacation' reached 50%.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition rounded-xl"
            title="Settings"
          >
            <FaCog size={18} />
          </button>

          {/* User Profile Menu */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setOpenMenu(!openMenu);
                setOpenNotifications(false);
              }}
              className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
            >
              <FaUserCircle size={32} className="text-blue-600 dark:text-blue-400" />
              <div className="hidden md:block text-left">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.first_name || "User"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <FaChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${
                  openMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {openMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 p-1.5 space-y-1">
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl flex items-center gap-2 transition"
                >
                  <FaUser className="text-slate-400" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setOpenMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl flex items-center gap-2 transition"
                >
                  <FaCog className="text-slate-400" />
                  Settings
                </button>

                <div className="border-t border-slate-100 dark:border-slate-700/60 my-1" />

                <button
                  onClick={logout}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl flex items-center gap-2 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}