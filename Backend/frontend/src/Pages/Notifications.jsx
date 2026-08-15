import { useEffect, useState } from "react";

import {
  FaBell,
  FaCheck,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import api from "../services/api";


function Notifications() {

  // =========================================================
  // STATE
  // =========================================================

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteNotification, setDeleteNotification] =
    useState(null);

  const [processing, setProcessing] = useState(false);


  // =========================================================
  // CLOSE DELETE MODAL WHEN PAGE LOADS
  // =========================================================

  useEffect(() => {

    setDeleteNotification(null);

  }, []);


  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {

    try {

      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("access");

      const response = await api.get(
        "notifications/",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );

    } catch (err) {

      console.error(
        "Notification fetch error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {

    fetchNotifications();

  }, []);


  // =========================================================
  // MARK AS READ
  // =========================================================

  const markAsRead = async (
    notification
  ) => {

    if (notification.is_read) {

      return;

    }

    try {

      const token =
        localStorage.getItem("access");

      await api.patch(
        `notifications/${notification.id}/read/`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        (previous) =>
          previous.map(
            (item) =>
              item.id === notification.id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
          )
      );

    } catch (err) {

      console.error(
        "Mark read error:",
        err
      );

      setError(
        "Unable to mark notification as read."
      );

    }
  };


  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const markAllAsRead = async () => {

    const unread =
      notifications.filter(
        (item) => !item.is_read
      );

    if (unread.length === 0) {

      return;

    }

    try {

      setProcessing(true);

      const token =
        localStorage.getItem("access");

      await Promise.all(

        unread.map(
          (notification) =>
            api.patch(
              `notifications/${notification.id}/read/`,
              {},
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )
        )

      );

      setNotifications(
        (previous) =>
          previous.map(
            (item) => ({
              ...item,
              is_read: true,
            })
          )
      );

    } catch (err) {

      console.error(
        "Mark all read error:",
        err
      );

      setError(
        "Unable to mark all notifications as read."
      );

    } finally {

      setProcessing(false);

    }
  };


  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================

  const confirmDelete = async () => {

    if (!deleteNotification) {

      return;

    }

    try {

      setProcessing(true);

      const token =
        localStorage.getItem("access");

      await api.delete(
        `notifications/${deleteNotification.id}/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotifications(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              deleteNotification.id
          )
      );

      setDeleteNotification(null);

    } catch (err) {

      console.error(
        "Delete notification error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to delete notification."
      );

    } finally {

      setProcessing(false);

    }
  };


  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  // =========================================================
  // NOTIFICATION TYPE ICON
  // =========================================================

  const getIcon = (type) => {

    switch (type) {

      case "SUCCESS":

        return (
          <FaCheckCircle
            className="text-emerald-600"
          />
        );

      case "WARNING":

        return (
          <FaExclamationTriangle
            className="text-orange-600"
          />
        );

      case "ALERT":

        return (
          <FaExclamationCircle
            className="text-rose-600"
          />
        );

      default:

        return (
          <FaInfoCircle
            className="text-indigo-600"
          />
        );
    }
  };


  // =========================================================
  // ICON BACKGROUND
  // =========================================================

  const getIconBackground = (type) => {

    switch (type) {

      case "SUCCESS":

        return "bg-emerald-100";

      case "WARNING":

        return "bg-orange-100";

      case "ALERT":

        return "bg-rose-100";

      default:

        return "bg-indigo-100";
    }
  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateString) => {

    if (!dateString) {

      return "";

    }

    const date =
      new Date(dateString);

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-slate-50
        flex
      "
    >

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-[280px]
          bg-slate-950
          text-white
          flex-shrink-0
        "
      >

        <Sidebar />

      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div
        className="
          flex-1
          min-w-0
        "
      >

        <Topbar />


        <main
          className="
            p-6
            md:p-8
          "
        >

          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
              mb-8
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaBell
                    className="
                      text-indigo-600
                      text-xl
                    "
                  />

                </div>


                <div>

                  <h1
                    className="
                      text-3xl
                      md:text-4xl
                      font-bold
                      text-slate-800
                    "
                  >
                    Notifications
                  </h1>


                  <p
                    className="
                      text-slate-500
                      mt-1
                    "
                  >
                    Stay updated with your
                    financial activity.
                  </p>

                </div>

              </div>

            </div>


            {/* MARK ALL */}

            {unreadCount > 0 && (

              <button
                onClick={markAllAsRead}
                disabled={processing}
                className="
                  cursor-pointer
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  font-semibold
                  shadow-md
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                <FaCheck />

                Mark All as Read

              </button>

            )}

          </div>


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (

            <div
              className="
                mb-6
                p-4
                rounded-xl
                bg-rose-50
                border
                border-rose-200
                text-rose-700
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                  "
                >
                  {error}
                </p>


                <button
                  onClick={() =>
                    setError("")
                  }
                  className="
                    cursor-pointer
                    text-rose-500
                    hover:text-rose-700
                  "
                >

                  <FaTimes />

                </button>

              </div>

            </div>

          )}


          {/* =================================================
              SUMMARY
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
              mb-8
            "
          >

            {/* TOTAL */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Total Notifications
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {notifications.length}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-indigo-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaBell
                    className="
                      text-indigo-600
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* UNREAD */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Unread
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {unreadCount}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-orange-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaExclamationTriangle
                    className="
                      text-orange-600
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>


            {/* READ */}

            <div
              className="
                bg-white
                rounded-2xl
                p-6
                border
                border-slate-100
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Read
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-slate-800
                      mt-2
                    "
                  >
                    {notifications.length -
                      unreadCount}
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-emerald-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaCheckCircle
                    className="
                      text-emerald-600
                      text-xl
                    "
                  />

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              NOTIFICATION LIST
          ================================================== */}

          <div
            className="
              bg-white
              rounded-3xl
              border
              border-slate-100
              shadow-sm
              overflow-hidden
            "
          >

            <div
              className="
                p-6
                border-b
                border-slate-100
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                    "
                  >
                    Recent Notifications
                  </h2>


                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-1
                    "
                  >
                    Your latest BudgetBuddy updates.
                  </p>

                </div>


                {unreadCount > 0 && (

                  <span
                    className="
                      px-3
                      py-1.5
                      rounded-full
                      bg-indigo-100
                      text-indigo-700
                      text-sm
                      font-semibold
                    "
                  >
                    {unreadCount} unread
                  </span>

                )}

              </div>

            </div>


            {/* =================================================
                LOADING
            ================================================== */}

            {loading ? (

              <div
                className="
                  min-h-[300px]
                  flex
                  flex-col
                  items-center
                  justify-center
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    border-4
                    border-indigo-200
                    border-t-indigo-600
                    rounded-full
                    animate-spin
                  "
                ></div>


                <p
                  className="
                    text-slate-500
                    mt-4
                  "
                >
                  Loading notifications...
                </p>

              </div>

            ) : notifications.length === 0 ? (

              /* =================================================
                  EMPTY
              ================================================== */

              <div
                className="
                  min-h-[350px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-8
                "
              >

                <div
                  className="
                    w-20
                    h-20
                    rounded-3xl
                    bg-indigo-50
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <FaBell
                    className="
                      text-3xl
                      text-indigo-500
                    "
                  />

                </div>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-800
                  "
                >
                  No Notifications
                </h3>


                <p
                  className="
                    text-slate-500
                    mt-2
                    max-w-md
                  "
                >
                  You're all caught up!
                  New notifications will
                  appear here.
                </p>

              </div>

            ) : (

              <div
                className="
                  divide-y
                  divide-slate-100
                "
              >

                {notifications.map(
                  (notification) => (

                    <div
                      key={
                        notification.id
                      }
                      className={`
  p-6
  transition-all
  duration-200
  border-l-4
  ${
    notification.is_read
      ? "bg-white hover:bg-slate-50 border-l-transparent"
      : "bg-indigo-50 hover:bg-indigo-100 border-l-indigo-600"
  }
`}
                    >

                      <div
                        className="
                          flex
                          gap-4
                        "
                      >

                        {/* ICON */}

                        <div
                          className={`
                            w-12
                            h-12
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            ${getIconBackground(
                              notification.notification_type
                            )}
                          `}
                        >

                          {getIcon(
                            notification.notification_type
                          )}

                        </div>


                        {/* CONTENT */}

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >

                          <div
                            className="
                              flex
                              flex-col
                              md:flex-row
                              md:items-start
                              md:justify-between
                              gap-3
                            "
                          >

                            <div>

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <h3
                                  className={`
                                    text-lg
                                    ${
                                      notification.is_read
                                        ? "font-semibold"
                                        : "font-bold"
                                    }
                                    text-slate-800
                                  `}
                                >

                                  {
                                    notification.title
                                  }

                                </h3>


                                {!notification.is_read && (

                                  <span
                                    className="
                                      w-2.5
                                      h-2.5
                                      rounded-full
                                      bg-indigo-600
                                    "
                                  ></span>

                                )}

                              </div>


                              <p
                                className="
                                  text-slate-500
                                  mt-1
                                  leading-relaxed
                                "
                              >

                                {
                                  notification.message
                                }

                              </p>

                            </div>


                            {/* TYPE */}

                            <span
                              className={`
                                self-start
                                px-3
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                ${
                                  notification.notification_type ===
                                  "SUCCESS"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : notification.notification_type ===
                                      "WARNING"
                                      ? "bg-orange-100 text-orange-700"
                                      : notification.notification_type ===
                                        "ALERT"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-indigo-100 text-indigo-700"
                                }
                              `}
                            >

                              {
                                notification.notification_type
                              }

                            </span>

                          </div>


                          {/* BOTTOM */}

                          <div
                            className="
                              flex
                              flex-col
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                              gap-3
                              mt-4
                            "
                          >

                            <span
                              className="
                                text-xs
                                text-slate-400
                              "
                            >

                              {
                                formatDate(
                                  notification.created_at
                                )
                              }

                            </span>


                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              {/* MARK READ */}

                              {!notification.is_read && (

                                <button
                                  onClick={() =>
                                    markAsRead(
                                      notification
                                    )
                                  }
                                  className="
                                    cursor-pointer
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-lg
                                    bg-indigo-50
                                    text-indigo-600
                                    hover:bg-indigo-600
                                    hover:text-white
                                    text-sm
                                    font-semibold
                                    transition
                                  "
                                >

                                  <FaCheck />

                                  Mark as Read

                                </button>

                              )}


                              {/* DELETE */}

                              <button
                                onClick={() =>
                                  setDeleteNotification(
                                    notification
                                  )
                                }
                                className="
                                  cursor-pointer
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-rose-50
                                  text-rose-600
                                  hover:bg-rose-600
                                  hover:text-white
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <FaTrash />

                                Delete

                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </main>

      </div>


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {deleteNotification && (

        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            p-4
          "
        >

          {/* BACKDROP */}

          <div
            className="
              absolute
              inset-0
              bg-black/50
            "
            onClick={() => {

              if (!processing) {

                setDeleteNotification(
                  null
                );

              }

            }}
          ></div>


          {/* DIALOG */}

          <div
            className="
              relative
              z-[10000]
              w-full
              max-w-md
              bg-white
              rounded-3xl
              shadow-2xl
              p-7
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-rose-100
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FaTrash
                className="
                  text-rose-600
                  text-xl
                "
              />

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-slate-800
              "
            >
              Delete Notification?
            </h2>


            <p
              className="
                text-slate-500
                mt-2
                leading-relaxed
              "
            >

              Are you sure you want to delete{" "}

              <span
                className="
                  font-semibold
                  text-slate-700
                "
              >
                "{deleteNotification.title}"
              </span>

              ?

              <br />

              This action cannot be undone.

            </p>


            <div
              className="
                flex
                justify-end
                gap-3
                mt-7
              "
            >

              <button
                onClick={() =>
                  setDeleteNotification(
                    null
                  )
                }
                disabled={processing}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-600
                  hover:bg-slate-50
                  font-semibold
                  transition
                "
              >

                Cancel

              </button>


              <button
                onClick={confirmDelete}
                disabled={processing}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  bg-rose-600
                  hover:bg-rose-700
                  text-white
                  font-semibold
                  transition
                  disabled:opacity-50
                "
              >

                {processing
                  ? "Deleting..."
                  : "Yes, Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Notifications;