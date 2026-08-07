import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckDouble,
  FaTrash,
  FaArrowRight,
  FaBell,
  FaFilter,
} from "react-icons/fa";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../api/notificationApi";
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD | READ
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.results)) list = res.data.results;
      else if (Array.isArray(res?.results)) list = res.results;

     
  list.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
    setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  // Map notification types to deep-link application routes
  const getRouteForType = (type) => {
    if (!type) return "/dashboard";
    const t = type.toUpperCase();
    if (t.includes("INCOME")) return "/income";
    if (t.includes("EXPENSE")) return "/expenses";
    if (t.includes("BUDGET")) return "/budget";
    if (t.includes("SAVINGS") || t.includes("GOAL")) return "/savings";
    if (t.includes("REPORT")) return "/reports";
    return "/dashboard";
  };

  const handleNotificationClick = async (item) => {
    // 1. Mark as read on backend if unread
    if (!(item.is_read ?? item.read)) {
      try {
        await markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      } catch (err) {
        console.error("Error marking read", err);
      }
    }

    // 2. Direct Redirect to relevant app page
    const targetRoute = getRouteForType(item.notification_type);
    navigate(targetRoute);
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const filteredList = notifications.filter((item) => {
    const isRead = item.is_read ?? item.read;
    if (filter === "UNREAD") return !isRead;
    if (filter === "READ") return isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !(n.is_read ?? n.read)).length;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold dark:text-white flex items-center gap-3">
            <FaBell className="text-blue-600" /> Notifications Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with real-time financial alerts, budget warnings, and savings goals.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl hover:bg-blue-100 transition shrink-0 border border-blue-200 dark:border-blue-800"
          >
            <FaCheckDouble /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
        <FaFilter className="text-slate-400 text-xs mr-2" />
        {["ALL", "UNREAD", "READ"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {f === "ALL" ? `All (${notifications.length})` : f === "UNREAD" ? `Unread (${unreadCount})` : "Read"}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading notifications...</div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No notifications found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((item) => {
            const isRead = item.is_read ?? item.read;
            const dateVal = item.created_at;
            const formattedDate = dateVal
              ? new Date(dateVal).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                  isRead
                    ? "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 opacity-75 hover:opacity-100"
                    : "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-semibold text-base ${isRead ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
                      {item.title}
                    </h3>
                    {!isRead && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {item.message}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block font-medium">
                    {formattedDate}
                  </span>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition text-sm flex items-center gap-1 font-semibold">
                    View <FaArrowRight className="text-xs" />
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete Notification"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}