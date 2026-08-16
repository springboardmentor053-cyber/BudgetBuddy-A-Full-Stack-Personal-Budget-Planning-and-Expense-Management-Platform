import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaBell,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaBars,
} from "react-icons/fa";

import { MdAccountCircle } from "react-icons/md";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";


function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();


  /* =========================================================
     SEARCH
  ========================================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  /* =========================================================
     PAGE TITLES
  ========================================================= */

  const pageTitles = {
    "/dashboard": "Financial Dashboard",
    "/income": "Income",
    "/expense": "Expenses",
    "/expenses": "Expenses",
    "/transactions": "Transactions",
    "/budget": "Budgets",
    "/budgets": "Budgets",
    "/savings": "Savings Goals",
    "/notifications": "Notifications",
    "/reports": "Financial Reports",
  };


  const pageTitle =
    pageTitles[location.pathname] ||
    "Financial Dashboard";


  /* =========================================================
     DATE
  ========================================================= */

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


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

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

  const [
    newNotification,
    setNewNotification,
  ] = useState(null);

  const previousNotificationIds =
    useRef(new Set());

  const firstNotificationFetch =
    useRef(true);

  const notificationRef =
    useRef(null);


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) {
      navigate("/transactions");
      return;
    }

    navigate(
      `/transactions?search=${encodeURIComponent(
        query
      )}`
    );
  };


  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };


  /* =========================================================
     SEARCH URL SYNC
  ========================================================= */

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    const query =
      params.get("search") || "";

    setSearchQuery(query);
  }, [location.search]);


  /* =========================================================
     MOBILE SIDEBAR
  ========================================================= */

  const openMobileSidebar = () => {
    window.dispatchEvent(
      new Event("toggle-sidebar")
    );
  };


  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const token =
        localStorage.getItem("access");

      if (!token) {
        setNotifications([]);
        return;
      }

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

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      const sortedNotifications =
        [...data].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );


      /* =================================================
         NEW NOTIFICATION
      ================================================= */

      if (!firstNotificationFetch.current) {
        const newlyCreated =
          sortedNotifications.filter(
            (notification) =>
              !previousNotificationIds.current.has(
                notification.id
              )
          );

        if (newlyCreated.length > 0) {
          const newest = newlyCreated[0];

          setNewNotification(newest);
          setShowNotifications(false);

          setTimeout(() => {
            setNewNotification(null);
          }, 5000);
        }
      }


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
      setLoadingNotifications(false);
    }
  };


  /* =========================================================
     INITIAL FETCH + AUTO REFRESH
  ========================================================= */

  useEffect(() => {
    fetchNotifications();

    const interval =
      setInterval(() => {
        fetchNotifications();
      }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);


  /* =========================================================
     CLOSE NOTIFICATIONS WHEN PAGE CHANGES
  ========================================================= */

  useEffect(() => {
    setShowNotifications(false);
    setNewNotification(null);
  }, [location.pathname]);


  /* =========================================================
     CLOSE DROPDOWN OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
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


  /* =========================================================
     UNREAD COUNT
  ========================================================= */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  const latestNotifications =
    notifications.slice(0, 5);


  /* =========================================================
     NOTIFICATION ICON
  ========================================================= */

  const getNotificationIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return (
          <FaCheckCircle
            className="
              text-[#92643E]
              text-lg
            "
          />
        );

      case "WARNING":
        return (
          <FaExclamationTriangle
            className="
              text-[#92643E]
              text-lg
            "
          />
        );

      case "ALERT":
        return (
          <FaExclamationCircle
            className="
              text-[#56061D]
              text-lg
            "
          />
        );

      default:
        return (
          <FaInfoCircle
            className="
              text-[#101C2E]
              text-lg
            "
          />
        );
    }
  };


  /* =========================================================
     DATE FORMAT
  ========================================================= */

  const formatNotificationTime = (
    dateString
  ) => {
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


  /* =========================================================
     OPEN NOTIFICATIONS PAGE
  ========================================================= */

  const openNotificationsPage = () => {
    setShowNotifications(false);
    setNewNotification(null);

    navigate("/notifications");
  };


  const toggleNotifications = () => {
    setShowNotifications(
      (previous) => !previous
    );
  };


  const closeNewNotification = () => {
    setNewNotification(null);
  };


  return (
    <header
      className="
        min-h-[80px]
        bg-white
        border-b
        border-[#E5DDD2]
        px-4
        sm:px-6
        md:px-8
        py-3
        flex
        flex-wrap
        items-center
        justify-between
        gap-3
        sticky
        top-0
        z-40
      "
    >

      {/* =====================================================
          LEFT
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          min-w-0
        "
      >

        {/* MOBILE MENU */}

        <button
          type="button"
          onClick={openMobileSidebar}
          className="
            lg:hidden
            w-10
            h-10
            rounded-xl
            bg-[#F8F5EF]
            border
            border-[#E5DDD2]
            flex
            items-center
            justify-center
            text-[#101C2E]
            hover:bg-[#F3EBDD]
            hover:text-[#56061D]
            transition
            cursor-pointer
            shrink-0
          "
          aria-label="Open menu"
        >
          <FaBars />
        </button>


        <div className="min-w-0">

          <h1
            className="
              text-lg
              sm:text-xl
              md:text-2xl
              font-semibold
              text-[#101C2E]
              truncate
            "
          >
            {pageTitle}
          </h1>

          <p
            className="
              text-[#6F665B]
              text-xs
              sm:text-sm
              mt-1
              truncate
            "
          >
            {today}
          </p>

        </div>

      </div>


      {/* =====================================================
          RIGHT
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-2
          sm:gap-3
          md:gap-4
        "
      >

        {/* =================================================
            DESKTOP SEARCH
        ================================================== */}

        <div
          className="
            hidden
            md:flex
            items-center
            bg-[#F8F5EF]
            border
            border-[#E5DDD2]
            rounded-xl
            px-4
            py-2.5
            w-56
            lg:w-80
            transition
            focus-within:border-[#92643E]
          "
        >

          <button
            type="button"
            onClick={handleSearch}
            title="Search transactions"
            className="
              flex
              items-center
              justify-center
              cursor-pointer
              mr-3
              shrink-0
            "
          >
            <FaSearch
              className="
                text-[#8B8175]
                hover:text-[#92643E]
                transition
              "
            />
          </button>


          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            onKeyDown={handleSearchKeyDown}
            placeholder="Search transactions..."
            className="
              bg-transparent
              outline-none
              w-full
              text-[#101C2E]
              placeholder:text-[#A99F91]
              text-sm
            "
          />

        </div>


        {/* =================================================
            MOBILE SEARCH
        ================================================== */}

        <button
          type="button"
          onClick={() => {
            const query =
              window.prompt(
                "Search transactions"
              );

            if (query !== null) {
              setSearchQuery(query);

              if (query.trim()) {
                navigate(
                  `/transactions?search=${encodeURIComponent(
                    query.trim()
                  )}`
                );
              } else {
                navigate("/transactions");
              }
            }
          }}
          className="
            md:hidden
            w-10
            h-10
            rounded-xl
            bg-[#F8F5EF]
            border
            border-[#E5DDD2]
            flex
            items-center
            justify-center
            text-[#101C2E]
            hover:bg-[#F3EBDD]
            hover:text-[#92643E]
            transition
            cursor-pointer
          "
          title="Search"
        >
          <FaSearch />
        </button>


        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            type="button"
            onClick={toggleNotifications}
            title="Notifications"
            className="
              cursor-pointer
              relative
              w-10
              h-10
              sm:w-11
              sm:h-11
              rounded-xl
              bg-[#F8F5EF]
              border
              border-[#E5DDD2]
              hover:bg-[#F3EBDD]
              hover:border-[#92643E]
              transition
              flex
              items-center
              justify-center
            "
          >

            <FaBell
              className="
                text-[#101C2E]
                text-base
                sm:text-lg
              "
            />


            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-[19px]
                  h-5
                  px-1
                  rounded-full
                  bg-[#56061D]
                  text-white
                  text-[10px]
                  sm:text-[11px]
                  font-semibold
                  flex
                  items-center
                  justify-center
                  border-2
                  border-white
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
                top-20
                sm:top-24
                right-3
                sm:right-6
                z-[100]
                w-[380px]
                max-w-[calc(100vw-24px)]
                bg-[#F3EBDD]
                border
                border-[#D8C8B4]
                rounded-2xl
                shadow-[0_20px_50px_rgba(16,28,46,0.20)]
                overflow-hidden
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

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#E8DCC8]
                    border
                    border-[#D8C8B4]
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


                <div className="
                  flex-1
                  min-w-0
                ">

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
                        font-semibold
                        text-[#101C2E]
                        text-sm
                      "
                    >
                      {newNotification.title}
                    </h4>

                    <button
                      type="button"
                      onClick={closeNewNotification}
                      className="
                        text-[#9B9185]
                        hover:text-[#56061D]
                        cursor-pointer
                      "
                    >
                      <FaTimes />
                    </button>

                  </div>


                  <p
                    className="
                      text-sm
                      text-[#625A52]
                      mt-1
                      leading-5
                    "
                  >
                    {newNotification.message}
                  </p>


                  <p
                    className="
                      text-[11px]
                      text-[#9B9185]
                      mt-2
                    "
                  >
                    {formatNotificationTime(
                      newNotification.created_at
                    )}
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={openNotificationsPage}
                className="
                  w-full
                  py-2.5
                  bg-[#56061D]
                  hover:bg-[#6D0A27]
                  text-[#F3EBDD]
                  text-sm
                  font-medium
                  cursor-pointer
                  transition
                "
              >
                View Notification
              </button>

            </div>
          )}


          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================== */}

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-12
                sm:top-14
                w-[400px]
                max-w-[calc(100vw-24px)]
                bg-[#F3EBDD]
                rounded-2xl
                shadow-[0_20px_50px_rgba(16,28,46,0.20)]
                border
                border-[#D8C8B4]
                overflow-hidden
                z-50
              "
            >

              <div
                className="
                  px-4
                  sm:px-5
                  py-4
                  bg-[#F3EBDD]
                  border-b
                  border-[#D8C8B4]
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h3
                    className="
                      font-semibold
                      text-[#101C2E]
                      text-base
                      sm:text-lg
                    "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                      text-xs
                      text-[#81776B]
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
                    w-9
                    h-9
                    sm:w-10
                    sm:h-10
                    rounded-xl
                    bg-[#E8DCC8]
                    border
                    border-[#D8C8B4]
                    flex
                    items-center
                    justify-center
                  "
                >
                  <FaBell className="text-[#56061D]" />
                </div>

              </div>


              {loadingNotifications ? (

                <div
                  className="
                    py-12
                    text-center
                    bg-[#F3EBDD]
                  "
                >

                  <div
                    className="
                      w-8
                      h-8
                      mx-auto
                      border-4
                      border-[#D8C8B4]
                      border-t-[#56061D]
                      rounded-full
                      animate-spin
                    "
                  />

                  <p
                    className="
                      text-sm
                      text-[#81776B]
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
                    bg-[#F3EBDD]
                  "
                >

                  <FaBell
                    className="
                      mx-auto
                      text-3xl
                      text-[#C4B8A8]
                    "
                  />

                  <p
                    className="
                      text-sm
                      text-[#81776B]
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
                    bg-[#E8DCC8]
                  "
                >

                  {latestNotifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={
                          openNotificationsPage
                        }
                        className={`
                          cursor-pointer
                          w-full
                          text-left
                          px-4
                          sm:px-5
                          py-4
                          flex
                          gap-3
                          border-b
                          border-[#D8C8B4]
                          transition
                          ${
                            notification.is_read
                              ? `
                                bg-[#F3EBDD]
                                hover:bg-[#EFE3D1]
                              `
                              : `
                                bg-[#E4D4C2]
                                hover:bg-[#DCC9B5]
                              `
                          }
                        `}
                      >

                        <div
                          className="
                            w-9
                            h-9
                            sm:w-10
                            sm:h-10
                            rounded-xl
                            bg-[#F3EBDD]
                            border
                            border-[#D8C8B4]
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
                                    ? "font-medium"
                                    : "font-semibold"
                                }
                                text-[#101C2E]
                              `}
                            >
                              {notification.title}
                            </h4>


                            {!notification.is_read && (
                              <span
                                className="
                                  w-2
                                  h-2
                                  rounded-full
                                  bg-[#56061D]
                                  flex-shrink-0
                                "
                              />
                            )}

                          </div>


                          <p
                            className="
                              text-sm
                              leading-5
                              text-[#625A52]
                              mt-1
                            "
                          >
                            {notification.message}
                          </p>


                          <p
                            className="
                              text-[11px]
                              font-medium
                              text-[#9B9185]
                              mt-2
                            "
                          >
                            {formatNotificationTime(
                              notification.created_at
                            )}
                          </p>

                        </div>

                      </button>
                    )
                  )}

                </div>

              )}


              {notifications.length > 0 && (
                <div
                  className="
                    p-3
                    bg-[#F3EBDD]
                    border-t
                    border-[#D8C8B4]
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
                      bg-[#56061D]
                      hover:bg-[#6D0A27]
                      text-[#F3EBDD]
                      font-medium
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
            gap-2
            sm:gap-3
          "
        >

          <MdAccountCircle
            className="
              text-4xl
              sm:text-5xl
              text-[#101C2E]
            "
          />


          <div className="hidden sm:block">

            <h3
              className="
                font-medium
                text-[#101C2E]
                text-sm
                md:text-base
              "
            >
              Welcome Back
            </h3>

            <p
              className="
                text-xs
                md:text-sm
                text-[#6F665B]
              "
            >
              BudgetBuddy User
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          MOBILE SEARCH BAR
      ====================================================== */}

      <div
        className="
          md:hidden
          w-full
          basis-full
          flex
          items-center
          bg-[#F8F5EF]
          border
          border-[#E5DDD2]
          rounded-xl
          px-4
          py-2.5
          focus-within:border-[#92643E]
        "
      >

        <FaSearch
          className="
            text-[#8B8175]
            mr-3
            shrink-0
          "
        />


        <input
          type="text"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(
              event.target.value
            )
          }
          onKeyDown={handleSearchKeyDown}
          placeholder="Search transactions..."
          className="
            bg-transparent
            outline-none
            w-full
            text-[#101C2E]
            placeholder:text-[#A99F91]
            text-sm
          "
        />

      </div>

    </header>
  );
}

export default Topbar;