import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaBell,
  FaSearch,
  FaMoon,
  FaSun,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

import { MdAccountCircle } from "react-icons/md";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";


function Topbar() {

  // =========================================================
  // DARK MODE
  // =========================================================

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });


  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add("dark");

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.documentElement.classList.remove("dark");

      localStorage.setItem(
        "theme",
        "light"
      );

    }

  }, [darkMode]);


  const location = useLocation();
  const navigate = useNavigate();


  // =========================================================
  // PAGE TITLES
  // =========================================================

  const pageTitles = {

    "/dashboard": "Financial Dashboard",

    "/income": "Income",

    "/expense": "Expenses",

    "/expenses": "Expenses",

    "/budget": "Budgets",

    "/budgets": "Budgets",

    "/savings": "Savings Goals",

    "/notifications": "Notifications",

    "/reports": "Financial Reports",

  };


  const pageTitle =
    pageTitles[location.pathname] ||
    "Financial Dashboard";


  // =========================================================
  // DATE
  // =========================================================

  const today =
    new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );


  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);


  const [
    loadingNotifications,
    setLoadingNotifications,
  ] = useState(false);


  // =========================================================
  // NEW NOTIFICATION POPUP
  // =========================================================

  const [
    newNotification,
    setNewNotification,
  ] = useState(null);


  // Store IDs that were already known
  const previousNotificationIds =
    useRef(new Set());


  // First fetch completed
  const firstNotificationFetch =
    useRef(true);


  // =========================================================
  // NOTIFICATION DROPDOWN REF
  // =========================================================

  const notificationRef =
    useRef(null);


  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {

    try {

      setLoadingNotifications(true);

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


      // -------------------------------------------------------
      // SUPPORT BOTH:
      // response.data = [...]
      // response.data.results = [...]
      // -------------------------------------------------------

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];


      // -------------------------------------------------------
      // SORT NEWEST FIRST
      // -------------------------------------------------------

      const sortedNotifications =
        [...data].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );


      // -------------------------------------------------------
      // CHECK FOR NEW NOTIFICATION
      // -------------------------------------------------------

      if (
        !firstNotificationFetch.current
      ) {

        const newlyCreated =
          sortedNotifications.filter(
            (notification) =>
              !previousNotificationIds.current.has(
                notification.id
              )
          );


        if (newlyCreated.length > 0) {

          // Get newest notification
          const newest =
            newlyCreated[0];


          // ---------------------------------------------------
          // SHOW AUTOMATIC POPUP
          // ---------------------------------------------------

          setNewNotification(
            newest
          );


          // ---------------------------------------------------
          // OPEN NOTIFICATION DROPDOWN
          // ---------------------------------------------------

          setShowNotifications(
            false
          );


          // ---------------------------------------------------
          // CLOSE TOAST AFTER 5 SECONDS
          // ---------------------------------------------------

          setTimeout(() => {

            setNewNotification(null);

          }, 5000);

        }

      }


      // -------------------------------------------------------
      // UPDATE KNOWN NOTIFICATION IDS
      // -------------------------------------------------------

      previousNotificationIds.current =
        new Set(
          sortedNotifications.map(
            (notification) =>
              notification.id
          )
        );


      firstNotificationFetch.current =
        false;


      setNotifications(
        sortedNotifications
      );


    } catch (error) {

      console.error(
        "Unable to fetch notifications:",
        error
      );

    } finally {

      setLoadingNotifications(
        false
      );

    }

  };


  // =========================================================
  // INITIAL FETCH + AUTO REFRESH
  // =========================================================

  useEffect(() => {

    fetchNotifications();


    const interval =
      setInterval(() => {

        fetchNotifications();

      }, 3000);


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  // =========================================================
  // CLOSE DROPDOWN WHEN PAGE CHANGES
  // =========================================================

  useEffect(() => {

    setShowNotifications(
      false
    );

    setNewNotification(
      null
    );

  }, [location.pathname]);


  // =========================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {

          setShowNotifications(
            false
          );

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  // =========================================================
  // LATEST NOTIFICATIONS
  // =========================================================

  const latestNotifications =
    notifications.slice(0, 5);


  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon =
    (type) => {

      switch (type) {

        case "SUCCESS":

          return (
            <FaCheckCircle
              className="
                text-emerald-500
                text-lg
              "
            />
          );


        case "WARNING":

          return (
            <FaExclamationTriangle
              className="
                text-orange-500
                text-lg
              "
            />
          );


        case "ALERT":

          return (
            <FaExclamationCircle
              className="
                text-red-500
                text-lg
              "
            />
          );


        default:

          return (
            <FaInfoCircle
              className="
                text-indigo-500
                text-lg
              "
            />
          );

      }

    };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatNotificationTime =
    (dateString) => {

      if (!dateString) {
        return "";
      }


      return new Date(
        dateString
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    };


  // =========================================================
  // OPEN NOTIFICATIONS PAGE
  // =========================================================

  const openNotificationsPage =
    () => {

      setShowNotifications(
        false
      );

      setNewNotification(
        null
      );

      navigate(
        "/notifications"
      );

    };


  // =========================================================
  // TOGGLE NOTIFICATIONS
  // =========================================================

  const toggleNotifications =
    () => {

      setShowNotifications(
        (previous) => !previous
      );

    };


  // =========================================================
  // CLOSE NEW NOTIFICATION TOAST
  // =========================================================

  const closeNewNotification =
    () => {

      setNewNotification(
        null
      );

    };


  // =========================================================
  // UI
  // =========================================================

  return (

    <header
      className="
        h-[80px]
        bg-white
        dark:bg-slate-900
        border-b
        border-slate-200
        dark:border-slate-700
        px-6
        md:px-8
        flex
        items-center
        justify-between
        sticky
        top-0
        z-40
      "
    >

      {/* =====================================================
          LEFT
      ====================================================== */}

      <div>

        <h1
          className="
            text-2xl
            font-bold
            text-slate-800
            dark:text-slate-100
          "
        >
          {pageTitle}
        </h1>


        <p
          className="
            text-slate-500
            dark:text-slate-400
            text-sm
            mt-1
          "
        >
          {today}
        </p>

      </div>


      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-4
          md:gap-6
        "
      >

        {/* =================================================
            SEARCH
        ================================================== */}

        <div
          className="
            hidden
            lg:flex
            items-center
            bg-slate-100
            dark:bg-slate-800
            rounded-xl
            px-4
            py-2
            w-80
          "
        >

          <FaSearch
            className="
              text-slate-400
              mr-3
            "
          />


          <input
            type="text"
            placeholder="Search transactions..."
            className="
              bg-transparent
              outline-none
              w-full
              text-slate-700
              dark:text-slate-200
              placeholder:text-slate-400
            "
          />

        </div>


        {/* =================================================
            DARK MODE
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setDarkMode(
              (previous) =>
                !previous
            )
          }
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="
            cursor-pointer
            w-11
            h-11
            rounded-xl
            bg-slate-100
            hover:bg-slate-200
            dark:bg-slate-800
            dark:hover:bg-slate-700
            transition
            flex
            items-center
            justify-center
          "
        >

          {darkMode ? (

            <FaSun
              className="
                text-yellow-400
              "
            />

          ) : (

            <FaMoon
              className="
                text-slate-600
                dark:text-slate-300
              "
            />

          )}

        </button>


        {/* =================================================
            NOTIFICATION
        ================================================== */}

        <div
          ref={notificationRef}
          className="
            relative
          "
        >

          {/* =================================================
              BELL
          ================================================== */}

          <button
            type="button"
            onClick={
              toggleNotifications
            }
            className="
              cursor-pointer
              relative
              w-11
              h-11
              rounded-xl
              bg-slate-100
              hover:bg-slate-200
              dark:bg-slate-800
              dark:hover:bg-slate-700
              transition
              flex
              items-center
              justify-center
            "
          >

            <FaBell
              className="
                text-slate-600
                dark:text-slate-200
              "
            />


            {/* UNREAD BADGE */}

            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-[20px]
                  h-5
                  px-1
                  rounded-full
                  bg-red-500
                  text-white
                  text-[11px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  border-2
                  border-white
                  dark:border-slate-900
                "
              >

                {unreadCount > 99
                  ? "99+"
                  : unreadCount}

              </span>

            )}

          </button>


          {/* =================================================
              NEW NOTIFICATION TOAST
          ================================================== */}

          {newNotification && (

            <div
              className="
                fixed
                top-24
                right-6
                z-[100]
                w-[380px]
                max-w-[calc(100vw-32px)]
                bg-white
                dark:bg-slate-800
                border
                border-slate-200
                dark:border-slate-700
                rounded-2xl
                shadow-2xl
                overflow-hidden
                animate-[slideIn_0.3s_ease-out]
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                  p-4
                "
              >

                {/* ICON */}

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-indigo-100
                    dark:bg-indigo-900/40
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                >

                  {getNotificationIcon(
                    newNotification.notification_type
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
                      items-center
                      justify-between
                      gap-2
                    "
                  >

                    <h4
                      className="
                        font-bold
                        text-slate-900
                        dark:text-white
                        text-sm
                      "
                    >
                      {newNotification.title}
                    </h4>


                    <button
                      type="button"
                      onClick={
                        closeNewNotification
                      }
                      className="
                        text-slate-400
                        hover:text-slate-700
                        dark:hover:text-white
                        cursor-pointer
                      "
                    >

                      <FaTimes />

                    </button>

                  </div>


                  <p
                    className="
                      text-sm
                      text-slate-600
                      dark:text-slate-300
                      mt-1
                      leading-5
                    "
                  >
                    {newNotification.message}
                  </p>


                  <p
                    className="
                      text-[11px]
                      text-slate-400
                      mt-2
                    "
                  >
                    {formatNotificationTime(
                      newNotification.created_at
                    )}
                  </p>

                </div>

              </div>


              {/* VIEW */}

              <button
                type="button"
                onClick={
                  openNotificationsPage
                }
                className="
                  w-full
                  py-2
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  text-sm
                  font-semibold
                  cursor-pointer
                "
              >
                View Notification
              </button>

            </div>

          )}


          {/* =================================================
              DROPDOWN
          ================================================== */}

          {showNotifications && (

            <div
              className="
                absolute
                right-0
                top-14
                w-[400px]
                max-w-[calc(100vw-32px)]
                bg-white
                dark:bg-slate-800
                rounded-2xl
                shadow-2xl
                border
                border-slate-200
                dark:border-slate-700
                overflow-hidden
                z-50
              "
            >

              {/* HEADER */}

              <div
                className="
                  px-5
                  py-4
                  bg-white
                  dark:bg-slate-800
                  border-b
                  border-slate-200
                  dark:border-slate-700
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h3
                    className="
                      font-bold
                      text-slate-900
                      dark:text-white
                      text-lg
                    "
                  >
                    Notifications
                  </h3>


                  <p
                    className="
                      text-xs
                      text-slate-500
                      dark:text-slate-300
                      mt-1
                    "
                  >

                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1
                            ? "s"
                            : ""
                        }`
                      : "You're all caught up"}

                  </p>

                </div>


                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-indigo-100
                    dark:bg-indigo-900/40
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaBell
                    className="
                      text-indigo-600
                      dark:text-indigo-400
                    "
                  />

                </div>

              </div>


              {/* CONTENT */}

              {loadingNotifications ? (

                <div
                  className="
                    py-12
                    text-center
                    bg-white
                    dark:bg-slate-800
                  "
                >

                  <div
                    className="
                      w-8
                      h-8
                      mx-auto
                      border-4
                      border-indigo-200
                      border-t-indigo-600
                      rounded-full
                      animate-spin
                    "
                  ></div>


                  <p
                    className="
                      text-sm
                      text-slate-500
                      dark:text-slate-300
                      mt-3
                    "
                  >
                    Loading notifications...
                  </p>

                </div>

              ) : latestNotifications.length === 0 ? (

                <div
                  className="
                    py-12
                    px-6
                    text-center
                    bg-white
                    dark:bg-slate-800
                  "
                >

                  <FaBell
                    className="
                      mx-auto
                      text-3xl
                      text-slate-300
                      dark:text-slate-600
                    "
                  />


                  <p
                    className="
                      text-sm
                      text-slate-500
                      dark:text-slate-300
                      mt-3
                    "
                  >
                    No notifications
                  </p>

                </div>

              ) : (

                <div
                  className="
                    max-h-[380px]
                    overflow-y-auto
                    bg-slate-50
                    dark:bg-slate-900
                  "
                >

                  {latestNotifications.map(
                    (notification) => (

                      <button
                        type="button"
                        key={
                          notification.id
                        }
                        onClick={
                          openNotificationsPage
                        }
                        className={`
                          cursor-pointer
                          w-full
                          text-left
                          px-5
                          py-4
                          flex
                          gap-3
                          border-b
                          border-slate-200
                          dark:border-slate-700
                          transition
                          ${
                            notification.is_read
                              ? `
                                bg-white
                                hover:bg-slate-50
                                dark:bg-slate-800
                                dark:hover:bg-slate-700
                              `
                              : `
                                bg-indigo-50
                                hover:bg-indigo-100
                                dark:bg-indigo-950/50
                                dark:hover:bg-indigo-950/70
                              `
                          }
                        `}
                      >

                        {/* ICON */}

                        <div
                          className="
                            w-10
                            h-10
                            rounded-xl
                            bg-white
                            dark:bg-slate-700
                            border
                            border-slate-200
                            dark:border-slate-600
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                          "
                        >

                          {getNotificationIcon(
                            notification.notification_type
                          )}

                        </div>


                        {/* TEXT */}

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <h4
                              className={`
                                text-[15px]
                                truncate
                                ${
                                  notification.is_read
                                    ? "font-semibold"
                                    : "font-bold"
                                }
                                text-slate-900
                                dark:text-white
                              `}
                            >
                              {
                                notification.title
                              }
                            </h4>


                            {!notification.is_read && (

                              <span
                                className="
                                  w-2
                                  h-2
                                  rounded-full
                                  bg-indigo-600
                                  dark:bg-indigo-400
                                  flex-shrink-0
                                "
                              ></span>

                            )}

                          </div>


                          <p
                            className="
                              text-sm
                              leading-5
                              text-slate-600
                              dark:text-slate-300
                              mt-1
                            "
                          >
                            {
                              notification.message
                            }
                          </p>


                          <p
                            className="
                              text-[11px]
                              font-medium
                              text-slate-400
                              dark:text-slate-500
                              mt-2
                            "
                          >
                            {
                              formatNotificationTime(
                                notification.created_at
                              )
                            }
                          </p>

                        </div>

                      </button>

                    )
                  )}

                </div>

              )}


              {/* VIEW ALL */}

              {notifications.length > 0 && (

                <div
                  className="
                    p-3
                    bg-white
                    dark:bg-slate-800
                    border-t
                    border-slate-200
                    dark:border-slate-700
                  "
                >

                  <button
                    type="button"
                    onClick={
                      openNotificationsPage
                    }
                    className="
                      cursor-pointer
                      w-full
                      py-2.5
                      rounded-xl
                      bg-indigo-600
                      hover:bg-indigo-700
                      text-white
                      font-semibold
                      text-sm
                      transition
                    "
                  >
                    View All Notifications
                  </button>

                </div>

              )}

            </div>

          )}

        </div>


        {/* =================================================
            USER
        ================================================== */}

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <MdAccountCircle
            className="
              text-5xl
              text-indigo-600
            "
          />


          <div
            className="
              hidden
              sm:block
            "
          >

            <h3
              className="
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              Welcome Back
            </h3>


            <p
              className="
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              BudgetBuddy User
            </p>

          </div>

        </div>

      </div>

    </header>

  );

}


export default Topbar;