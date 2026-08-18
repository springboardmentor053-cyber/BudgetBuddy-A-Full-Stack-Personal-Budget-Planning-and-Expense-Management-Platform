import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import api from "../../services/api";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  

useEffect(() => {
  fetchNotifications();

  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000);

  return () => clearInterval(interval);
}, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("notifications/");
      console.log("🔔 NOTIFICATIONS RECEIVED:", res.data);
      setNotifications(res.data);
    } catch (err) {
      console.error("❌ FETCH NOTIFICATIONS ERROR:", err);
    }
  }
//   async function markAsRead(id: number) {
//   try {
//     await api.patch(`notifications/${id}/read/`, {});
//     fetchNotifications();
//   } catch (err) {
//     console.log(err);
//     console.log("MARK READ ERROR:", err);
//   }
// }
// async function markAsRead(id: number) {
//   try {
//     const response = await api.patch(
//       `notifications/${id}/read/`,
//       {}
//     );

//     console.log("✅ MARK READ RESPONSE:", response.data);

//     // Immediately decrease unread count in frontend
//     setNotifications((prev) =>
//       prev.map((item) =>
//         item.id === id
//           ? { ...item, is_read: true }
//           : item
//       )
//     );

//   } catch (err) {
//     console.error("❌ MARK READ ERROR:", err);
//   }
// }
async function markAsRead(id: number) {
  console.log("🔴 CLICKED NOTIFICATION ID:", id);

  try {
    const response = await api.patch(
      `notifications/${id}/read/`,
      {}
    );

    console.log("🟢 PATCH STATUS:", response.status);
    console.log("🟢 PATCH RESPONSE:", response.data);

    setNotifications((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, is_read: true }
          : item
      );

      console.log("🟡 UPDATED NOTIFICATIONS:", updated);

      return updated;
    });

  } catch (error: any) {
    console.error("🔴 PATCH ERROR:", error);
    console.error("🔴 SERVER RESPONSE:", error.response?.data);
  }
}
async function handleNotificationOpen() {
  const unread = notifications.filter(
    (item) => !item.is_read
  );

  setOpen(true);

  if (unread.length === 0) return;

  try {
    await Promise.all(
      unread.map((item) =>
        api.patch(`notifications/${item.id}/read/`, {})
      )
    );

    // Immediately update the frontend
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
      }))
    );

  } catch (err) {
    console.error("❌ ERROR MARKING NOTIFICATIONS:", err);
  }
}

const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;
  return (
    <div className="relative">

      {/* Bell */}

      <button
        onClick={handleNotificationOpen}
        className="relative w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
      >
        <FaBell className="mx-auto text-gray-700" />
         {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border z-50">

          <div className="p-4 border-b font-semibold text-lg">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <div className="p-5 text-gray-500 text-center">
              No Notifications
            </div>
          ) : (
            notifications.map((item) => (

            <div
  key={item.id}
  onClick={() => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
  }}
  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
    !item.is_read ? "bg-indigo-50" : ""
  }`}
>

                <h3 className="font-semibold">
                {item.title}
                </h3>
                {!item.is_read && (
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                  )}

                <p className="text-sm text-gray-600 mt-1">
                {item.message}
                </p>

                {/* {!item.is_read && (

                <button
                    onClick={() => markAsRead(item.id)}
                    className="text-indigo-600 text-sm mt-2 hover:underline"
                >
                    Mark as Read
                </button>

                )} */}

            </div>

            ))
          )}

        </div>
      )}

    </div>
  );
}

export default NotificationDropdown;