import {
  FaBell,
  FaMoon,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [today, setToday] = useState("");
  const [time, setTime] = useState("");

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    function updateClock() {
      const now = new Date();

      setToday(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );

      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");
  }

  return (
    <div className="bg-white h-24 border-b border-gray-200 flex items-center justify-between px-10">

      {/* LEFT */}

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500 mt-2">
          {today}
          <span className="mx-3">•</span>
          {time}
        </p>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-6">

        {/* Theme */}

        <button className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          <FaMoon className="mx-auto text-gray-700" />
        </button>

        {/* Notification */}

        <button className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          <FaBell className="mx-auto text-gray-700" />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        {/* User */}

        <div
          className="relative"
          ref={menuRef}
        >
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <FaUserCircle
              size={45}
              className="text-indigo-600"
            />

            <div>
              <h3 className="font-semibold">
                Kanna
              </h3>

              <p className="text-gray-500 text-sm">
                Personal Account
              </p>
            </div>

            <FaChevronDown className="text-gray-500" />
          </div>

          {showMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">

              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 transition"
              >
                <FaUser />
                Profile
              </button>

              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-100 transition"
              >
                <FaCog />
                Settings
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-4 text-red-600 hover:bg-red-50 transition"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;