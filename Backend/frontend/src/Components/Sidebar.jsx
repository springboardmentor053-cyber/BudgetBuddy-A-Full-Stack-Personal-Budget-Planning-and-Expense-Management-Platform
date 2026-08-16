import {
  FaTachometerAlt,
  FaWallet,
  FaMoneyBillWave,
  FaPiggyBank,
  FaBullseye,
  FaBell,
  FaChartBar,
  FaExchangeAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

import { MdAccountBalanceWallet } from "react-icons/md";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import LogoutModal from "./LogoutModal";


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setMobileOpen(false);

    navigate("/");
  };


  /* =====================================================
     MOBILE SIDEBAR EVENT
  ===================================================== */

  useEffect(() => {
    const handleToggleSidebar = () => {
      setMobileOpen((previous) => !previous);
    };

    window.addEventListener(
      "toggle-sidebar",
      handleToggleSidebar
    );

    return () => {
      window.removeEventListener(
        "toggle-sidebar",
        handleToggleSidebar
      );
    };
  }, []);


  /* =====================================================
     CLOSE MOBILE SIDEBAR WHEN PAGE CHANGES
  ===================================================== */

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);


  /* =====================================================
     MENU
  ===================================================== */

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
      name: "Transactions",
      path: "/transactions",
      icon: <FaExchangeAlt />,
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


  /* =====================================================
     CLOSE SIDEBAR
  ===================================================== */

  const closeSidebar = () => {
    setMobileOpen(false);
  };


  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            bg-[#101C2E]/40
            backdrop-blur-[2px]
            z-40
            lg:hidden
          "
          onClick={closeSidebar}
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-50
          w-[253px]
          flex
          flex-col
          overflow-hidden
          bg-white
          text-[#101C2E]
          border-r
          border-[#E5DDD2]
          shadow-[8px_0_30px_rgba(16,28,46,0.08)]
          transition-transform
          duration-300
          ease-in-out
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-3
            px-5
            py-5
            border-b
          "
          style={{
            borderColor: "#E5DDD2",
          }}
        >

          <div
            className="
              rounded-xl
              p-2.5
              flex-shrink-0
              flex
              items-center
              justify-center
              shadow-md
            "
            style={{
              background:
                "linear-gradient(135deg, #56061D, #92643E)",
              boxShadow:
                "0 8px 20px rgba(86,6,29,0.18)",
            }}
          >
            <MdAccountBalanceWallet
              className="text-2xl"
              style={{
                color: "#F3EBDD",
              }}
            />
          </div>


          <div className="min-w-0 flex-1">

            <h1
              className="
                text-xl
                font-bold
                tracking-wide
              "
              style={{
                color: "#101C2E",
              }}
            >
              BudgetBuddy
            </h1>

            <p
              className="text-xs mt-0.5"
              style={{
                color: "#8B8175",
              }}
            >
              Personal Finance Manager
            </p>

          </div>


          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={closeSidebar}
            className="
              lg:hidden
              w-9
              h-9
              rounded-xl
              flex
              items-center
              justify-center
              text-[#6F665B]
              hover:text-[#56061D]
              hover:bg-[#F3EBDD]
              transition
              cursor-pointer
              shrink-0
            "
            aria-label="Close menu"
          >
            <FaTimes />
          </button>

        </div>


        {/* =================================================
            MENU
        ================================================= */}

        <div
          className="
            flex-1
            py-5
            px-1
            overflow-y-auto
          "
        >

          <p
            className="
              px-5
              mb-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
            "
            style={{
              color: "#9B9185",
            }}
          >
            Main Menu
          </p>


          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
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
                group
                ${
                  isActive
                    ? "shadow-sm"
                    : ""
                }
              `}
              style={({ isActive }) => ({
                backgroundColor: isActive
                  ? "#F3EBDD"
                  : "transparent",

                color: isActive
                  ? "#56061D"
                  : "#6F665B",

                border: isActive
                  ? "1px solid #E5DDD2"
                  : "1px solid transparent",

                boxShadow: isActive
                  ? "0 5px 15px rgba(86,6,29,0.07)"
                  : "none",
              })}
              onMouseEnter={(e) => {
                if (
                  !e.currentTarget.getAttribute(
                    "aria-current"
                  )
                ) {
                  e.currentTarget.style.backgroundColor =
                    "#F8F5EF";

                  e.currentTarget.style.color =
                    "#56061D";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  !e.currentTarget.getAttribute(
                    "aria-current"
                  )
                ) {
                  e.currentTarget.style.backgroundColor =
                    "transparent";

                  e.currentTarget.style.color =
                    "#6F665B";
                }
              }}
            >

              <span
                className="
                  text-lg
                  flex-shrink-0
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              >
                {item.icon}
              </span>

              <span
                className="
                  font-medium
                  tracking-wide
                "
              >
                {item.name}
              </span>

            </NavLink>
          ))}

        </div>


        {/* =================================================
            BOTTOM PROFILE
        ================================================= */}

        <div
          className="
            border-t
            px-4
            py-4
          "
          style={{
            borderColor: "#E5DDD2",
          }}
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-4
              px-2
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-full
                flex
                items-center
                justify-center
                font-semibold
                shrink-0
                border-2
              "
              style={{
                backgroundColor: "#92643E",
                borderColor: "#B88A63",
                color: "#F3EBDD",
              }}
            >
              P
            </div>


            <div className="min-w-0">

              <h3
                className="font-medium text-sm"
                style={{
                  color: "#101C2E",
                }}
              >
                Welcome
              </h3>

              <p
                className="text-xs"
                style={{
                  color: "#8B8175",
                }}
              >
                Budget Manager
              </p>

            </div>

          </div>


          <div
            className="
              border-t
              mb-4
            "
            style={{
              borderColor: "#E5DDD2",
            }}
          />


          {/* SETTINGS */}

          <button
            type="button"
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-xl
              text-sm
              transition-all
              duration-300
              mb-2
              border
            "
            style={{
              backgroundColor: "#F8F5EF",
              borderColor: "#E5DDD2",
              color: "#6F665B",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "#F3EBDD";

              e.currentTarget.style.color =
                "#56061D";

              e.currentTarget.style.borderColor =
                "#D8C8B4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "#F8F5EF";

              e.currentTarget.style.color =
                "#6F665B";

              e.currentTarget.style.borderColor =
                "#E5DDD2";
            }}
          >
            <FaCog className="text-sm" />
            Settings
          </button>


          {/* LOGOUT */}

          <button
            type="button"
            onClick={() =>
              setShowLogoutModal(true)
            }
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-all
              duration-300
              shadow-sm
            "
            style={{
              background:
                "linear-gradient(135deg, #56061D, #6F1730)",
              color: "#F3EBDD",
              boxShadow:
                "0 8px 20px rgba(86,6,29,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #6F1730, #92643E)";

              e.currentTarget.style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #56061D, #6F1730)";

              e.currentTarget.style.transform =
                "translateY(0)";
            }}
          >
            <FaSignOutAlt className="text-sm" />
            Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          LOGOUT MODAL
      ================================================= */}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() =>
          setShowLogoutModal(false)
        }
        onLogout={handleLogout}
      />

    </>
  );
}

export default Sidebar;