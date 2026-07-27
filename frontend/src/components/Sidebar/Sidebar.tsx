import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
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
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col">

      <div className="p-8 border-b">

        <h1 className="text-3xl font-bold text-indigo-600">
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
                ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>

        ))}

      </nav>

      <div className="p-5 border-t">

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