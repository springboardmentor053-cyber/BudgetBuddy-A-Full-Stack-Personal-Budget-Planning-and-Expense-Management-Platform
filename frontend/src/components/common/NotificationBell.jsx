import { useState, useEffect, useRef } from "react";
import { FaBell, FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getNotifications, markAsRead } from "../../api/notificationApi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Poll backend every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.results)) {
        data = response.data.results;
      } else if (Array.isArray(response?.results)) {
        data = response.results;
      }

      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const getRouteForType = (type) => {
    if (!type) return "/dashboard";
    const t = type.toUpperCase();
    if (t.includes("INCOME")) return "/income";
    if (t.includes("EXPENSE")) return "/expenses";
    if (t.includes("BUDGET")) return "/budget";
    if (t.includes("SAVINGS") || t.includes("GOAL")) return "/savings";
    return "/dashboard";
  };

  const getTypeBadge = (type) => {
    if (!type) return "🔔";
    const t = type.toUpperCase();
    if (t.includes("INCOME")) return "💰";
    if (t.includes("EXPENSE")) return "💸";
    if (t.includes("BUDGET_EXCEEDED") || t.includes("WARNING")) return "⚠️";
    if (t.includes("BUDGET")) return "📊";
    if (t.includes("SAVINGS") || t.includes("GOAL")) return "🎯";
    if (t.includes("MOTIVATION")) return "💡";
    return "🔔";
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true, read: true } : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = async (item) => {
    const isRead = item.is_read ?? item.read;
    if (!isRead) {
      await handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    navigate(getRouteForType(item.notification_type));
  };

  const unreadCount = notifications.filter(
    (item) => !(item.is_read ?? item.read)
  ).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden transition-all">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Notifications
            </h3>
            <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-semibold">
              {unreadCount} Unread
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications right now.
              </p>
            ) : (
              notifications.map((item) => {
                const isRead = item.is_read ?? item.read;
                const notificationTitle = item.title || "Notification";
                const notificationBody = item.message || item.description;

                const dateVal = item.event_date || item.created_at;
                const formattedDate = dateVal
                  ? new Date(dateVal).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-all duration-200 border-l-4 ${
                      isRead
                        ? "bg-white dark:bg-slate-800 border-transparent opacity-60 hover:opacity-100"
                        : "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 hover:bg-blue-100/80 dark:hover:bg-blue-900/40"
                    }`}
                  >
                    {/* Visual Icon Badge */}
                    <div className="text-lg p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 shrink-0">
                      {getTypeBadge(item.notification_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isRead
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {notificationTitle}
                        </p>
                        {!isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 animate-ping"></span>
                        )}
                      </div>

                      {notificationBody && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {notificationBody}
                        </p>
                      )}

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Quick Action: Mark as Read */}
                    {!isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-500 hover:bg-white dark:hover:bg-slate-700 transition shrink-0"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-700 transition"
          >
            View All Notifications <FaExternalLinkAlt className="text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
}