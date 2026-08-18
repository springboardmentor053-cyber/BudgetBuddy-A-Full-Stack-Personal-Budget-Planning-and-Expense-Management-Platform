import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaFileAlt,
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
}

function Sidebar({ sidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  }

  const menu = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Income", icon: <FaWallet />, path: "/income" },
    { name: "Expense", icon: <FaMoneyBillWave />, path: "/expense" },
    { name: "Budget", icon: <FaPiggyBank />, path: "/budget" },
    { name: "Profile", icon: <FaUser />, path: "/profile" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
    {name: "Savings",icon: <FaPiggyBank/>,path: "/savings"},
    { name: "Reports", icon: <FaFileAlt />, path: "/reports" }
  ];
  return (
  <div
  className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-800
  text-gray-700 dark:text-gray-200 border-r border-gray-200
  dark:border-gray-700 flex flex-col transition-all duration-300
  ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}
>

      <div className="p-8 border-b border-gray-200 dark:border-gray-700">

        <h1
  style={{ color: "var(--accent-color)" }}
  className="font-bold"
>
  BudgetBuddy
</h1>

      </div>

      <nav className="flex-1 mt-6">

        {menu.map((item) => (

          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-8 py-4 transition-all
${
  location.pathname === item.path
    ? "bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-white border-r-4 border-indigo-600 font-semibold"
    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
}`}
          >
            {item.icon}
            {item.name}
          </Link>

        ))}

      </nav>

      <div className="p-5 border-t border-gray-200 dark:border-gray-700">

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
        >
          <FaSignOutAlt />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;