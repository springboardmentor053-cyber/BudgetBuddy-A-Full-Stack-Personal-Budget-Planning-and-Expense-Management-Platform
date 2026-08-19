import { useEffect, useState } from "react";

import {
  FaCog,
  FaUser,
  FaBell,
  FaShieldAlt,
  FaSignOutAlt,
  FaCheck,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";


function Settings() {

  const navigate = useNavigate();


  // =========================================================
  // USERNAME
  // =========================================================

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );


  // =========================================================
  // NOTIFICATION SETTING
  // =========================================================

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(() => {

    const saved =
      localStorage.getItem(
        "budgetbuddy-notifications"
      );

    return saved !== "false";

  });


  // =========================================================
  // LOAD USERNAME
  // =========================================================

  useEffect(() => {

    const savedUsername =
      localStorage.getItem("username");

    if (savedUsername) {

      setUsername(savedUsername);

    }

  }, []);


  // =========================================================
  // NOTIFICATION PREFERENCE
  // =========================================================

  const handleNotificationToggle = () => {

    const newValue =
      !notificationsEnabled;

    setNotificationsEnabled(newValue);

    localStorage.setItem(
      "budgetbuddy-notifications",
      String(newValue)
    );

  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem("access");

    localStorage.removeItem("refresh");

    localStorage.removeItem("username");

    navigate("/");

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-[#F8F5EF]
        p-4
        sm:p-6
        md:p-8
      "
    >

      <div
        className="
          max-w-5xl
          mx-auto
        "
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-8
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-[#56061D]
                flex
                items-center
                justify-center
                shrink-0
                shadow-md
              "
            >

              <FaCog
                className="
                  text-[#F3EBDD]
                  text-xl
                "
              />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  md:text-3xl
                  font-bold
                  text-[#101C2E]
                "
              >
                Settings
              </h1>

              <p
                className="
                  text-sm
                  text-[#6F665B]
                  mt-1
                "
              >
                Manage your account and
                application preferences.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            PROFILE
        ================================================= */}

        <section
          className="
            bg-white
            border
            border-[#E5DDD2]
            rounded-3xl
            p-5
            sm:p-6
            mb-6
            shadow-[0_8px_25px_rgba(16,28,46,0.06)]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-[#F3EBDD]
                flex
                items-center
                justify-center
              "
            >

              <FaUser
                className="
                  text-[#92643E]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-[#101C2E]
                "
              >
                Profile
              </h2>

              <p
                className="
                  text-xs
                  text-[#8B8175]
                "
              >
                Your BudgetBuddy account
              </p>

            </div>

          </div>


          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-4
            "
          >

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#92643E]
                border-2
                border-[#B88A63]
                flex
                items-center
                justify-center
                text-[#F3EBDD]
                text-2xl
                font-bold
                shrink-0
              "
            >

              {username
                ? username
                    .charAt(0)
                    .toUpperCase()
                : "U"}

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-[#8B8175]
                "
              >
                Username
              </p>

              <p
                className="
                  text-xl
                  font-semibold
                  text-[#101C2E]
                  mt-1
                  break-words
                "
              >
                {username}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          className="
            bg-white
            border
            border-[#E5DDD2]
            rounded-3xl
            p-5
            sm:p-6
            mb-6
            shadow-[0_8px_25px_rgba(16,28,46,0.06)]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-[#F3EBDD]
                flex
                items-center
                justify-center
              "
            >

              <FaBell
                className="
                  text-[#92643E]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-[#101C2E]
                "
              >
                Notifications
              </h2>

              <p
                className="
                  text-xs
                  text-[#8B8175]
                "
              >
                Control notification preferences.
              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              p-4
              rounded-2xl
              bg-[#F8F5EF]
              border
              border-[#E5DDD2]
            "
          >

            <div>

              <p
                className="
                  font-semibold
                  text-[#101C2E]
                "
              >
                Financial notifications
              </p>

              <p
                className="
                  text-xs
                  text-[#8B8175]
                  mt-1
                "
              >
                Receive BudgetBuddy alerts
                and reminders.
              </p>

            </div>


            <button
              type="button"
              onClick={
                handleNotificationToggle
              }
              className="
                w-14
                h-7
                rounded-full
                relative
                cursor-pointer
                transition
                duration-300
                shrink-0
              "
              style={{
                backgroundColor:
                  notificationsEnabled
                    ? "#92643E"
                    : "#D8C8B4",
              }}
            >

              <span
                className="
                  absolute
                  top-1
                  w-5
                  h-5
                  rounded-full
                  bg-white
                  shadow
                  transition-all
                  duration-300
                "
                style={{
                  left:
                    notificationsEnabled
                      ? "32px"
                      : "4px",
                }}
              />

            </button>

          </div>

        </section>


        {/* =================================================
            SECURITY
        ================================================= */}

        <section
          className="
            bg-white
            border
            border-[#E5DDD2]
            rounded-3xl
            p-5
            sm:p-6
            mb-6
            shadow-[0_8px_25px_rgba(16,28,46,0.06)]
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-5
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-[#F3EBDD]
                flex
                items-center
                justify-center
              "
            >

              <FaShieldAlt
                className="
                  text-[#92643E]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-[#101C2E]
                "
              >
                Account Security
              </h2>

              <p
                className="
                  text-xs
                  text-[#8B8175]
                "
              >
                Your account authentication status.
              </p>

            </div>

          </div>


          <div
            className="
              flex
              items-center
              gap-3
              p-4
              rounded-2xl
              bg-[#F8F5EF]
              border
              border-[#E5DDD2]
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-full
                bg-[#92643E]/10
                flex
                items-center
                justify-center
              "
            >

              <FaCheck
                className="
                  text-[#92643E]
                "
              />

            </div>


            <div>

              <p
                className="
                  font-semibold
                  text-[#101C2E]
                "
              >
                JWT authentication active
              </p>

              <p
                className="
                  text-xs
                  text-[#8B8175]
                  mt-1
                "
              >
                Your session uses secure
                authentication tokens.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <section
          className="
            bg-white
            border
            border-[#E5DDD2]
            rounded-3xl
            p-5
            sm:p-6
            shadow-[0_8px_25px_rgba(16,28,46,0.06)]
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-bold
                  text-[#101C2E]
                "
              >
                Sign Out
              </h2>

              <p
                className="
                  text-sm
                  text-[#8B8175]
                  mt-1
                "
              >
                Sign out of your BudgetBuddy account.
              </p>

            </div>


            <button
              type="button"
              onClick={handleLogout}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-[#56061D]
                hover:bg-[#6E0A28]
                text-[#F3EBDD]
                font-semibold
                cursor-pointer
                transition
                shadow-sm
              "
            >

              <FaSignOutAlt />

              Logout

            </button>

          </div>

        </section>


      </div>

    </div>

  );

}


export default Settings;