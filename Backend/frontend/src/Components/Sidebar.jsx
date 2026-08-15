import {
  FaTachometerAlt,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaBullseye,
  FaBell,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { MdAccountBalanceWallet } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

function Sidebar() {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");
  };

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Income",
      path: "/income",
      icon: <FaWallet />,
    },
    {
      name: "Expenses",
      path: "/expense",
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Budgets",
      path: "/budget",
      icon: <FaPiggyBank />,
    },
    {
      name: "Savings",
      path: "/savings",
      icon: <FaBullseye />,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <FaBell />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaChartBar />,
    },
  ];

  return (
    <>
      <aside
        className="
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-[253px]
          bg-slate-950
          text-white
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* ================================
            LOGO
        ================================= */}

        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">

          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-2.5 shadow-lg flex-shrink-0">
            <MdAccountBalanceWallet className="text-2xl text-white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-wide">
              BudgetBuddy
            </h1>

            <p className="text-slate-400 text-xs mt-0.5">
              Personal Finance Manager
            </p>
          </div>

        </div>


        {/* ================================
            MENU
        ================================= */}

        <div className="flex-1 py-4 overflow-hidden">

          {menu.map((item) => (

            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `
                mx-3
                mb-1.5
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition-all
                duration-300
                text-sm
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
                `
              }
            >

              <span className="text-lg flex-shrink-0">
                {item.icon}
              </span>

              <span className="font-medium">
                {item.name}
              </span>

            </NavLink>

          ))}

        </div>


        {/* ================================
            BOTTOM PROFILE
        ================================= */}

        <div className="border-t border-slate-800 px-4 py-4">

          {/* Profile */}

          <div className="flex items-center gap-3 mb-4">

            <img
              src="https://ui-avatars.com/api/?name=Peehal&background=4F46E5&color=fff"
              alt="profile"
              className="w-10 h-10 rounded-full ring-2 ring-indigo-500 flex-shrink-0"
            />

            <div className="min-w-0">

              <h3 className="font-semibold text-sm">
                Welcome
              </h3>

              <p className="text-xs text-slate-400">
                Budget Manager
              </p>

            </div>

          </div>


          <div className="border-t border-slate-800 mb-4"></div>


          {/* Settings */}

          <button
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-lg
              bg-slate-800
              hover:bg-slate-700
              text-sm
              transition-all
              duration-300
              mb-2
            "
          >

            <FaCog className="text-sm" />

            Settings

          </button>


          {/* Logout */}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-lg
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              hover:from-indigo-700
              hover:to-violet-700
              text-white
              text-sm
              font-semibold
              transition-all
              duration-300
              shadow-lg
            "
          >

            <FaSignOutAlt className="text-sm" />

            Logout

          </button>

        </div>

      </aside>


      {/* Logout Modal */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

    </>
  );
}

export default Sidebar;