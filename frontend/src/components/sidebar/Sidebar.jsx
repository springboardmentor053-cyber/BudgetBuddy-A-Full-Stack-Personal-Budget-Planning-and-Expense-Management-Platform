import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaHome,
  FaMoneyBillWave,
  FaArrowCircleUp,
  FaPiggyBank,
  FaChartPie,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  // Load user dynamic state from localStorage
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || { name: "Karuna" };
  });

  // Re-sync whenever user profile updates
  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || { name: "Karuna" });
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const mainMenu = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Income", icon: <FaArrowCircleUp />, path: "/income" },
    { name: "Expenses", icon: <FaMoneyBillWave />, path: "/expenses" },
    { name: "Budget", icon: <FaWallet />, path: "/budget" },
    { name: "Savings", icon: <FaPiggyBank />, path: "/savings" },
  ];

  const accountMenu = [
    { name: "Reports", icon: <FaChartPie />, path: "/reports" },
    { name: "Profile", icon: <FaUser />, path: "/profile" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  const userName = user.name || user.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        w-72 h-screen
        bg-[#0F172A] text-white
        shadow-xl
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        flex flex-col
      `}
    >
      {/* Logo Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
            <FaWallet className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">BudgetBuddy</h1>
            <p className="text-xs text-slate-400">Personal Finance</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden ml-3 text-white text-xl hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 mt-6 px-4 overflow-y-auto">
        {/* Main Section */}
        <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main
        </p>
        {mainMenu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg font-semibold"
                  : "hover:bg-slate-800 hover:translate-x-1 duration-300"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Account Section */}
        <p className="px-4 mt-8 mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Account
        </p>
        {accountMenu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg font-semibold"
                  : "hover:bg-slate-800 hover:translate-x-1 duration-300"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Dynamic User Info Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {userInitial}
          </div>
          <div>
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-slate-400">Welcome back</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-xl font-semibold justify-center transition"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}