import {
  FaBell,
  FaMoon,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getNotifications,markNotificationRead } from "../../services/notificationServices";
interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}
function Navbar({
  sidebarOpen,
  setSidebarOpen,
}: NavbarProps) {
  const [today, setToday] = useState("");
  const [time, setTime] = useState("");
  const [username, setUsername] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  useEffect(() => {
  async function loadAccentColor() {
    try {
      const response = await api.get("/profile/");

      const colors: any = {
        indigo: "#4f46e5",
        blue: "#2563eb",
        green: "#16a34a",
        purple: "#9333ea",
        pink: "#ec4899",
        orange: "#f97316",
      };

      setAccentColor(
        colors[response.data.accent_color] || "#4f46e5"
      );

    } catch (error) {
      console.log("Could not load accent color");
    }
  }

  loadAccentColor();
}, []);
  
  useEffect(() => {
  fetchNotifications();
  const name = localStorage.getItem("username");
  if (name) {
    setUsername(name);
  }
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000);

  return () => clearInterval(interval);
}, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
  console.log("Navbar mounted");
  fetchNotifications();
}, []);
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
        setShowNotifications(false);
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
    localStorage.removeItem("username");
    navigate("/");
  }
  const formatTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);

  const diff = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diff < 60) return "Just now";

  if (diff < 3600)
    return `${Math.floor(diff / 60)} minutes ago`;

  if (diff < 86400)
    return `${Math.floor(diff / 3600)} hours ago`;

  if (diff < 172800)
    return "Yesterday";

  if (diff < 604800)
    return `${Math.floor(diff / 86400)} days ago`;

  return date.toLocaleDateString("en-IN");
};

  return (
    
    <div className="bg-white dark:bg-gray-900 h-24 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-10 transition-colors duration-300">

      {/* LEFT */}
      {/* <button
  onClick={() =>
    setSidebarOpen(!sidebarOpen)
  }
  className="text-2xl"
> */}
  <button
  onClick={() => {
    setSidebarOpen(!sidebarOpen);
  }}
  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
>
  <FaBars className="text-xl text-gray-800 dark:text-white" />
</button>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {today}
          <span className="mx-3">•</span>
          {time}
        </p>
      </div>

      {/* RIGHT */}

      <div className="flex items-center gap-6">

        {/* Theme Button */}

        <button
  onClick={() => {
    const newMode = !document.documentElement.classList.contains("dark");

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }}
  className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
>
          <FaMoon className="mx-auto text-gray-700 dark:text-gray-200" />
        </button>

        {/* Notification */}

        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            className="relative w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <FaBell className="mx-auto text-gray-700 dark:text-gray-200" />
 <span>
  {notifications.filter((n) => !n.is_read).length}
</span>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Math.min(
                  notifications.filter(n => !n.is_read).length,
                  99
                )}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">

              <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-lg text-gray-800 dark:text-gray-100">
  Notifications
</div>

              {notifications.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-gray-400">
  No notifications
</p>
              ) : (
                notifications.map((item) => (

                <div
                  key={item.id}
                  onClick={async () => {
                    if (!item.is_read) {
                      try {
                        await markNotificationRead(item.id);

                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === item.id
                                ? { ...n, is_read: true }
                                : n
                            )
                          );
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className={`border-b border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition ${
  item.is_read
    ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
    : "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
}`}
                >

                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">

                    {!item.is_read && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      ></span>
                    )}

                    {item.title}

                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">

                    {item.message}

                  </p>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {formatTime(item.created_at)}
                    {new Date(item.created_at).toLocaleString("en-IN")}

                  </p>

                </div>

              ))
              )}

            </div>
          )}

        </div>

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
              style={{ color: accentColor }}
            />

            <div>
  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
    {username || "User"}
  </h3>

  <p className="text-gray-500 dark:text-gray-400 text-sm">
    Personal Account
  </p>
</div>

<FaChevronDown className="text-gray-500 dark:text-gray-300" />
          </div>

          {showMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">

              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FaUser style={{ color: accentColor }} />

                Profile
              </button>
              
              <button
                onClick={() => navigate("/settings")}
                className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FaCog style={{ color: accentColor }} />
                Settings
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 text-red-600 hover:bg-red-50 transition"
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