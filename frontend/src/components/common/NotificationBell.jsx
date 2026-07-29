import { useState, useEffect } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import { getNotifications, markAsRead } from "../../api/notificationApi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    // Poll backend every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const data = response.data || [];
      setNotifications(data);

      // Count unread items
      const count = data.filter((item) => !item.read && !item.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, read: true, is_read: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Notifications
            </h3>
            <span className="text-xs bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full font-semibold">
              {unreadCount} Unread
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications right now.
              </p>
            ) : (
              notifications.map((item) => {
                const isRead = item.read || item.is_read;
                return (
                  <div
                    key={item.id || item._id}
                    className={`p-4 flex justify-between items-start gap-3 transition ${
                      isRead
                        ? "bg-transparent opacity-75"
                        : "bg-blue-50/50 dark:bg-blue-900/10"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title || item.message}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently"}
                      </span>
                    </div>

                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id || item._id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}