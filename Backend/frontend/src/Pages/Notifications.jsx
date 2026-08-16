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

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deleteNotification, setDeleteNotification] =
    useState(null);

  const [processing, setProcessing] =
    useState(false);


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


      const response =
        await api.get(
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
            className="
              text-[#5F8069]
            "
          />
        );


      case "WARNING":

        return (
          <FaExclamationTriangle
            className="
              text-[#92643E]
            "
          />
        );


      case "ALERT":

        return (
          <FaExclamationCircle
            className="
              text-[#7A263D]
            "
          />
        );


      default:

        return (
          <FaInfoCircle
            className="
              text-[#92643E]
            "
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

        return "bg-[#8FB39B]/20";


      case "WARNING":

        return "bg-[#92643E]/10";


      case "ALERT":

        return "bg-[#56061D]/10";


      default:

        return "bg-[#92643E]/10";

    }

  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (
    dateString
  ) => {

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
  // NOTIFICATION TYPE STYLE
  // =========================================================

  const getTypeStyle = (type) => {

    switch (type) {

      case "SUCCESS":

        return `
          bg-[#8FB39B]/15
          text-[#5F8069]
          border
          border-[#8FB39B]/30
        `;


      case "WARNING":

        return `
          bg-[#92643E]/10
          text-[#92643E]
          border
          border-[#92643E]/25
        `;


      case "ALERT":

        return `
          bg-[#56061D]/10
          text-[#7A263D]
          border
          border-[#56061D]/20
        `;


      default:

        return `
          bg-[#92643E]/10
          text-[#92643E]
          border
          border-[#92643E]/25
        `;

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F5F2EC]
        flex
        overflow-x-hidden
      "
    >


      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div
        className="
          w-0
          lg:w-[280px]
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
          w-full
        "
      >

        <Topbar />


        <main
          className="
            p-4
            sm:p-6
            md:p-8
            w-full
            max-w-full
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
                    bg-[#92643E]
                    flex
                    items-center
                    justify-center
                    shadow-sm
                    shrink-0
                  "
                >

                  <FaBell
                    className="
                      text-white
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
                      text-[#101C2E]
                    "
                  >
                    Notifications
                  </h1>


                  <p
                    className="
                      text-[#6F665B]
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
                onClick={
                  markAllAsRead
                }
                disabled={
                  processing
                }
                className="
                  cursor-pointer
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  bg-[#56061D]
                  hover:bg-[#6F0A27]
                  text-white
                  font-semibold
                  shadow-md
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  w-full
                  md:w-auto
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
                bg-[#56061D]/10
                border
                border-[#56061D]/25
                text-[#7A263D]
              "
            >

              <div
                className="
                  flex
                  items-start
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
                    text-[#7A263D]
                    hover:text-[#56061D]
                    shrink-0
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
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
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

                <div>

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Total Notifications
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
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
                    bg-[#92643E]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  <FaBell
                    className="
                      text-white
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
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
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

                <div>

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Unread
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
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
                    bg-[#56061D]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  <FaExclamationTriangle
                    className="
                      text-white
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
                border-[#E5DDD2]
                shadow-[0_8px_24px_rgba(16,28,46,0.08)]
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

                <div>

                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                    "
                  >
                    Read
                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-[#101C2E]
                      mt-2
                    "
                  >
                    {
                      notifications.length -
                      unreadCount
                    }
                  </h2>

                </div>


                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#8FB39B]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >

                  <FaCheckCircle
                    className="
                      text-white
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
              border-[#E5DDD2]
              shadow-[0_8px_24px_rgba(16,28,46,0.08)]
              overflow-hidden
              w-full
            "
          >

            {/* HEADER */}

            <div
              className="
                p-5
                sm:p-6
                border-b
                border-[#E5DDD2]
              "
            >

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                "
              >

                <div>

                  <h2
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-[#101C2E]
                    "
                  >
                    Recent Notifications
                  </h2>


                  <p
                    className="
                      text-sm
                      text-[#6F665B]
                      mt-1
                    "
                  >
                    Your latest BudgetBuddy
                    updates.
                  </p>

                </div>


                {unreadCount > 0 && (

                  <span
                    className="
                      self-start
                      px-3
                      py-1.5
                      rounded-full
                      bg-[#56061D]/10
                      text-[#7A263D]
                      border
                      border-[#56061D]/15
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
                  p-6
                "
              >

                <div
                  className="
                    w-10
                    h-10
                    border-4
                    border-[#92643E]/25
                    border-t-[#92643E]
                    rounded-full
                    animate-spin
                  "
                />

                <p
                  className="
                    text-[#6F665B]
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
                    bg-[#92643E]/10
                    border
                    border-[#92643E]/20
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <FaBell
                    className="
                      text-3xl
                      text-[#92643E]
                    "
                  />

                </div>


                <h3
                  className="
                    text-xl
                    font-bold
                    text-[#101C2E]
                  "
                >
                  No Notifications
                </h3>


                <p
                  className="
                    text-[#6F665B]
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

              /* =================================================
                 NOTIFICATIONS
              ================================================== */

              <div
                className="
                  divide-y
                  divide-[#E5DDD2]
                "
              >

                {notifications.map(
                  (notification) => (

                    <div
                      key={
                        notification.id
                      }
                      className={`
                        p-4
                        sm:p-6
                        transition-all
                        duration-200
                        border-l-4
                        ${
                          notification.is_read
                            ? `
                              bg-white
                              hover:bg-[#FAF8F4]
                              border-l-transparent
                            `
                            : `
                              bg-[#F7F1E7]
                              hover:bg-[#F3EBDD]
                              border-l-[#56061D]
                            `
                        }
                      `}
                    >

                      <div
                        className="
                          flex
                          flex-col
                          sm:flex-row
                          gap-4
                        "
                      >

                        {/* =================================================
                            ICON
                        ================================================== */}

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


                        {/* =================================================
                            CONTENT
                        ================================================== */}

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
                              gap-3
                            "
                          >

                            <div>

                              <div
                                className="
                                  flex
                                  items-start
                                  gap-2
                                "
                              >

                                <h3
                                  className={`
                                    text-lg
                                    leading-snug
                                    ${
                                      notification.is_read
                                        ? "font-semibold"
                                        : "font-bold"
                                    }
                                    text-[#101C2E]
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
                                      bg-[#56061D]
                                      mt-2
                                      shrink-0
                                    "
                                  />

                                )}

                              </div>


                              <p
                                className="
                                  text-[#6F665B]
                                  mt-1
                                  leading-relaxed
                                  break-words
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
                                ${getTypeStyle(
                                  notification.notification_type
                                )}
                              `}
                            >
                              {
                                notification.notification_type
                              }
                            </span>

                          </div>


                          {/* =================================================
                              BOTTOM
                          ================================================== */}

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
                                text-[#9A9085]
                              "
                            >
                              {
                                formatDate(
                                  notification.created_at
                                )
                              }
                            </span>


                            {/* ACTIONS */}

                            <div
                              className="
                                flex
                                flex-wrap
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
                                    justify-center
                                    gap-2
                                    px-3
                                    py-2
                                    rounded-lg
                                    bg-[#92643E]/10
                                    text-[#92643E]
                                    border
                                    border-[#92643E]/20
                                    hover:bg-[#92643E]
                                    hover:text-white
                                    text-sm
                                    font-semibold
                                    transition
                                  "
                                >

                                  <FaCheck />

                                  <span>
                                    Mark as Read
                                  </span>

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
                                  justify-center
                                  gap-2
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-[#56061D]/10
                                  text-[#7A263D]
                                  border
                                  border-[#56061D]/20
                                  hover:bg-[#56061D]
                                  hover:text-white
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <FaTrash />

                                <span>
                                  Delete
                                </span>

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
              bg-[#101C2E]/50
              backdrop-blur-sm
            "
            onClick={() => {

              if (!processing) {

                setDeleteNotification(
                  null
                );

              }

            }}
          />


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
              p-6
              sm:p-7
              border
              border-[#E5DDD2]
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-[#56061D]/10
                flex
                items-center
                justify-center
                mb-5
              "
            >

              <FaTrash
                className="
                  text-[#7A263D]
                  text-xl
                "
              />

            </div>


            <h2
              className="
                text-2xl
                font-bold
                text-[#101C2E]
              "
            >
              Delete Notification?
            </h2>


            <p
              className="
                text-[#6F665B]
                mt-2
                leading-relaxed
                break-words
              "
            >
              Are you sure you want to
              delete{" "}

              <span
                className="
                  font-semibold
                  text-[#101C2E]
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
                flex-col-reverse
                sm:flex-row
                sm:justify-end
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
                  border-[#D8C8B4]
                  text-[#6F665B]
                  hover:bg-[#F3EBDD]
                  font-semibold
                  transition
                  w-full
                  sm:w-auto
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                onClick={
                  confirmDelete
                }
                disabled={processing}
                className="
                  cursor-pointer
                  px-5
                  py-3
                  rounded-xl
                  bg-[#56061D]
                  hover:bg-[#6F0A27]
                  text-white
                  font-semibold
                  transition
                  disabled:opacity-50
                  w-full
                  sm:w-auto
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