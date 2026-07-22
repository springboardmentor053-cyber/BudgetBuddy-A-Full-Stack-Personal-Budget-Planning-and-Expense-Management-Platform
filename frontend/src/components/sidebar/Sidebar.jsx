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

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Expenses", icon: <FaMoneyBillWave />, path: "/expenses" },
    { name: "Income", icon: <FaArrowCircleUp />, path: "/income" },
    { name: "Budget", icon: <FaWallet />, path: "/budget" },
    { name: "Savings", icon: <FaPiggyBank />, path: "/savings" },
    { name: "Reports", icon: <FaChartPie />, path: "/reports" },
    { name: "Profile", icon: <FaUser />, path: "/profile" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ];

  return (
    <aside
  className={`
    fixed top-0 left-0 z-50
    w-64 h-screen
    bg-slate-900 text-white
    shadow-xl
    transform transition-transform duration-300
    ${
      isOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }
    md:translate-x-0
  `}
>
      {/* Logo */}
<div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">

  <div className="flex items-center gap-2">
    <FaWallet className="text-cyan-400 text-2xl" />

    <h1 className="text-lg font-bold text-white">
      BudgetBuddy
    </h1>
  </div>

  <button
    onClick={() => setIsOpen(false)}
    className="md:hidden ml-3 text-white text-xl hover:text-red-400"
  >
    ✕
  </button>

</div>
      {/* Menu */}
      <nav className="flex-1 mt-6 px-4">

        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive
                  ? "bg-cyan-500 text-slate-900 font-semibold"
                  : "hover:bg-slate-800"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl font-semibold"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

    </aside>
  );
}