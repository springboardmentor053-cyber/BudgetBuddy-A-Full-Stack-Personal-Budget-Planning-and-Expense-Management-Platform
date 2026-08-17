import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("general");

  const [savedMessage, setSavedMessage] = useState("");

  const [preferences, setPreferences] = useState({
    darkMode:
      localStorage.getItem("darkMode") === "true",

    notifications:
      localStorage.getItem("notifications") !== "false",

    budgetAlerts:
      localStorage.getItem("budgetAlerts") !== "false",

    savingsAlerts:
      localStorage.getItem("savingsAlerts") !== "false",

    emailNotifications:
      localStorage.getItem("emailNotifications") !== "false",

    currency:
      localStorage.getItem("currency") || "INR",

    language:
      localStorage.getItem("language") || "English",
  });


  /* =====================================================
     PROFILE
  ===================================================== */

  const username =
    localStorage.getItem("username") || "User";

  const email =
    localStorage.getItem("email") || "Personal Account";


  /* =====================================================
     APPLY THEME
  ===================================================== */

  useEffect(() => {

    document.body.classList.toggle(
      "dark-mode",
      preferences.darkMode
    );

    localStorage.setItem(
      "darkMode",
      preferences.darkMode
    );

  }, [preferences.darkMode]);


  /* =====================================================
     CHANGE PREFERENCE
  ===================================================== */

  const handlePreferenceChange = (
    name,
    value
  ) => {

    setPreferences((previous) => ({
      ...previous,
      [name]: value,
    }));

    localStorage.setItem(
      name,
      value
    );

    if (name === "darkMode") {
      return;
    }

    setSavedMessage("Setting updated successfully.");

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);

  };


  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  const handleSave = () => {

    Object.entries(preferences).forEach(
      ([key, value]) => {

        localStorage.setItem(
          key,
          value
        );

      }
    );

    setSavedMessage(
      "Your settings have been saved successfully."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);

  };


  /* =====================================================
     RESET SETTINGS
  ===================================================== */

  const handleReset = () => {

    const defaultPreferences = {

      darkMode: false,

      notifications: true,

      budgetAlerts: true,

      savingsAlerts: true,

      emailNotifications: true,

      currency: "INR",

      language: "English",

    };

    setPreferences(
      defaultPreferences
    );

    Object.entries(
      defaultPreferences
    ).forEach(
      ([key, value]) => {

        localStorage.setItem(
          key,
          value
        );

      }
    );

    setSavedMessage(
      "Preferences have been reset."
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");

  };


  /* =====================================================
     DELETE ACCOUNT
  ===================================================== */

  const handleDeleteAccount = () => {

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    alert(
      "Account deletion should be connected to your backend API."
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="settings-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="settings-header">

        <div>

          <span className="settings-eyebrow">
            ⚙️ ACCOUNT SETTINGS
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile, preferences,
            notifications, and account security.
          </p>

        </div>

      </div>


      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {savedMessage && (

        <div className="settings-success">

          <span>✓</span>

          <p>
            {savedMessage}
          </p>

        </div>

      )}


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="settings-layout">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="settings-sidebar">


          {/* PROFILE PREVIEW */}

          <div className="profile-preview">

            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>

              <strong>
                {username}
              </strong>

              <span>
                {email}
              </span>

            </div>

          </div>


          {/* NAVIGATION */}

          <nav className="settings-navigation">


            <button
              className={
                activeSection === "general"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("general")
              }
            >

              <span className="settings-nav-icon">
                ⚙️
              </span>

              <span className="settings-nav-text">

                <strong>
                  General
                </strong>

                <small>
                  Basic preferences
                </small>

              </span>

            </button>


            <button
              className={
                activeSection === "appearance"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("appearance")
              }
            >

              <span className="settings-nav-icon">
                🎨
              </span>

              <span className="settings-nav-text">

                <strong>
                  Appearance
                </strong>

                <small>
                  Theme & display
                </small>

              </span>

            </button>


            <button
              className={
                activeSection === "notifications"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("notifications")
              }
            >

              <span className="settings-nav-icon">
                🔔
              </span>

              <span className="settings-nav-text">

                <strong>
                  Notifications
                </strong>

                <small>
                  Alerts & reminders
                </small>

              </span>

            </button>


            <button
              className={
                activeSection === "security"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("security")
              }
            >

              <span className="settings-nav-icon">
                🔐
              </span>

              <span className="settings-nav-text">

                <strong>
                  Security
                </strong>

                <small>
                  Account security
                </small>

              </span>

            </button>


            <button
              className={
                activeSection === "danger"
                  ? "settings-nav-item active danger-nav"
                  : "settings-nav-item danger-nav"
              }
              onClick={() =>
                setActiveSection("danger")
              }
            >

              <span className="settings-nav-icon">
                ⚠️
              </span>

              <span className="settings-nav-text">

                <strong>
                  Danger Zone
                </strong>

                <small>
                  Account actions
                </small>

              </span>

            </button>

          </nav>


          {/* LOGOUT */}

          <button
            className="settings-logout"
            onClick={handleLogout}
          >

            <span>
              🚪
            </span>

            Logout

          </button>

        </aside>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="settings-content">


          {/* =================================================
              GENERAL
          ================================================= */}

          {activeSection === "general" && (

            <section className="settings-panel">

              <div className="settings-panel-header">

                <div>

                  <span className="settings-section-label">
                    GENERAL
                  </span>

                  <h2>
                    General Preferences
                  </h2>

                  <p>
                    Manage the basic preferences
                    used throughout BudgetBuddy.
                  </p>

                </div>

                <div className="settings-panel-icon">
                  ⚙️
                </div>

              </div>


              <div className="settings-form">


                <div className="settings-form-group">

                  <label>
                    Currency
                  </label>

                  <select
                    value={preferences.currency}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "currency",
                        e.target.value
                      )
                    }
                  >

                    <option value="INR">
                      ₹ Indian Rupee (INR)
                    </option>

                    <option value="USD">
                      $ US Dollar (USD)
                    </option>

                    <option value="GBP">
                      £ British Pound (GBP)
                    </option>

                    <option value="EUR">
                      € Euro (EUR)
                    </option>

                  </select>

                </div>


                <div className="settings-form-group">

                  <label>
                    Language
                  </label>

                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "language",
                        e.target.value
                      )
                    }
                  >

                    <option value="English">
                      English
                    </option>

                    <option value="Hindi">
                      Hindi
                    </option>

                    <option value="Telugu">
                      Telugu
                    </option>

                  </select>

                </div>


              </div>


              <div className="settings-info-box">

                <span>
                  💡
                </span>

                <div>

                  <strong>
                    Your preferences
                  </strong>

                  <p>
                    These settings are stored locally
                    and will be remembered when you
                    return to BudgetBuddy.
                  </p>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              APPEARANCE
          ================================================= */}

          {activeSection === "appearance" && (

            <section className="settings-panel">

              <div className="settings-panel-header">

                <div>

                  <span className="settings-section-label">
                    APPEARANCE
                  </span>

                  <h2>
                    Customize Your Experience
                  </h2>

                  <p>
                    Choose how BudgetBuddy looks
                    on your screen.
                  </p>

                </div>

                <div className="settings-panel-icon">
                  🎨
                </div>

              </div>


              <div className="theme-selector">

                <div className="theme-selector-header">

                  <div>

                    <strong>
                      Application Theme
                    </strong>

                    <p>
                      Select your preferred appearance.
                    </p>

                  </div>

                  <span className="theme-current">

                    {preferences.darkMode
                      ? "Dark Mode"
                      : "Light Mode"}

                  </span>

                </div>


                <div className="theme-options">


                  {/* LIGHT */}

                  <button
                    className={`theme-card ${
                      !preferences.darkMode
                        ? "theme-card-active"
                        : ""
                    }`}
                    onClick={() =>
                      handlePreferenceChange(
                        "darkMode",
                        false
                      )
                    }
                  >

                    <div className="theme-preview light-preview">

                      <div className="preview-topbar"></div>

                      <div className="preview-body">

                        <div className="preview-sidebar"></div>

                        <div className="preview-content">

                          <div className="preview-line"></div>

                          <div className="preview-line short"></div>

                          <div className="preview-box"></div>

                        </div>

                      </div>

                    </div>


                    <div className="theme-card-info">

                      <div>

                        <strong>
                          ☀️ Light
                        </strong>

                        <span>
                          Clean and bright
                        </span>

                      </div>

                      {!preferences.darkMode && (

                        <span className="theme-check">
                          ✓
                        </span>

                      )}

                    </div>

                  </button>


                  {/* DARK */}

                  <button
                    className={`theme-card ${
                      preferences.darkMode
                        ? "theme-card-active"
                        : ""
                    }`}
                    onClick={() =>
                      handlePreferenceChange(
                        "darkMode",
                        true
                      )
                    }
                  >

                    <div className="theme-preview dark-preview">

                      <div className="preview-topbar"></div>

                      <div className="preview-body">

                        <div className="preview-sidebar"></div>

                        <div className="preview-content">

                          <div className="preview-line"></div>

                          <div className="preview-line short"></div>

                          <div className="preview-box"></div>

                        </div>

                      </div>

                    </div>


                    <div className="theme-card-info">

                      <div>

                        <strong>
                          🌙 Dark
                        </strong>

                        <span>
                          Easier on the eyes
                        </span>

                      </div>

                      {preferences.darkMode && (

                        <span className="theme-check">
                          ✓
                        </span>

                      )}

                    </div>

                  </button>


                </div>

              </div>


              <div className="settings-save-area">

                <button
                  className="settings-primary-button"
                  onClick={handleSave}
                >
                  💾 Save Preferences
                </button>

              </div>

            </section>

          )}


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeSection === "notifications" && (

            <section className="settings-panel">

              <div className="settings-panel-header">

                <div>

                  <span className="settings-section-label">
                    NOTIFICATIONS
                  </span>

                  <h2>
                    Notification Preferences
                  </h2>

                  <p>
                    Choose which financial alerts
                    you want to receive.
                  </p>

                </div>

                <div className="settings-panel-icon">
                  🔔
                </div>

              </div>


              <div className="settings-options">


                <div className="settings-option">

                  <div>

                    <strong>
                      All Notifications
                    </strong>

                    <p>
                      Receive important BudgetBuddy
                      notifications.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "notifications",
                          e.target.checked
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>


                <div className="settings-option">

                  <div>

                    <strong>
                      Budget Alerts
                    </strong>

                    <p>
                      Get notified when your spending
                      approaches your budget limit.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={preferences.budgetAlerts}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "budgetAlerts",
                          e.target.checked
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>


                <div className="settings-option">

                  <div>

                    <strong>
                      Savings Goal Alerts
                    </strong>

                    <p>
                      Receive updates about your
                      savings progress.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={preferences.savingsAlerts}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "savingsAlerts",
                          e.target.checked
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>


                <div className="settings-option">

                  <div>

                    <strong>
                      Email Notifications
                    </strong>

                    <p>
                      Receive important financial
                      notifications through email.
                    </p>

                  </div>

                  <label className="toggle">

                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />

                    <span></span>

                  </label>

                </div>


              </div>

            </section>

          )}


          {/* =================================================
              SECURITY
          ================================================= */}

          {activeSection === "security" && (

            <section className="settings-panel">

              <div className="settings-panel-header">

                <div>

                  <span className="settings-section-label">
                    SECURITY
                  </span>

                  <h2>
                    Account Security
                  </h2>

                  <p>
                    Manage your BudgetBuddy
                    account security.
                  </p>

                </div>

                <div className="settings-panel-icon">
                  🔐
                </div>

              </div>


              <div className="security-card">

                <div className="security-icon">
                  🔑
                </div>

                <div>

                  <strong>
                    Password
                  </strong>

                  <p>
                    Keep your account secure by
                    using a strong password.
                  </p>

                </div>

                <button
                  className="settings-secondary-button"
                  onClick={() =>
                    alert(
                      "Connect this button to your change-password API."
                    )
                  }
                >
                  Change Password
                </button>

              </div>


              <div className="security-divider"></div>


              <div className="security-card">

                <div className="security-icon">
                  🛡️
                </div>

                <div>

                  <strong>
                    JWT Authentication
                  </strong>

                  <p>
                    Your account uses secure
                    token-based authentication.
                  </p>

                </div>

                <span className="security-status">
                  Protected
                </span>

              </div>


              <div className="security-divider"></div>


              <div className="security-card">

                <div className="security-icon">
                  💻
                </div>

                <div>

                  <strong>
                    Current Session
                  </strong>

                  <p>
                    You are currently signed in
                    to BudgetBuddy.
                  </p>

                </div>

                <button
                  className="settings-secondary-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>

            </section>

          )}


          {/* =================================================
              DANGER ZONE
          ================================================= */}

          {activeSection === "danger" && (

            <section className="settings-panel danger-panel">

              <div className="settings-panel-header">

                <div>

                  <span className="settings-section-label danger-label">
                    DANGER ZONE
                  </span>

                  <h2>
                    Account Actions
                  </h2>

                  <p>
                    These actions can affect your
                    account and preferences.
                  </p>

                </div>

                <div className="settings-panel-icon danger-icon">
                  ⚠️
                </div>

              </div>


              <div className="danger-option">

                <div>

                  <strong>
                    Reset Preferences
                  </strong>

                  <p>
                    Restore currency, language,
                    notification, and theme settings
                    to their defaults.
                  </p>

                </div>

                <button
                  className="settings-secondary-button"
                  onClick={handleReset}
                >
                  Reset
                </button>

              </div>


              <div className="danger-option delete-option">

                <div>

                  <strong>
                    Delete Account
                  </strong>

                  <p>
                    Permanently delete your BudgetBuddy
                    account and associated data.
                  </p>

                </div>

                <button
                  className="danger-button"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>

              </div>

            </section>

          )}


        </main>

      </div>


      {/* =================================================
          FOOTER ACTIONS
      ================================================= */}

      <div className="settings-footer">

        <div>

          <strong>
            BudgetBuddy
          </strong>

          <span>
            Personal Finance Management
          </span>

        </div>

        <button
          className="settings-primary-button"
          onClick={handleSave}
        >
          💾 Save All Settings
        </button>

      </div>


    </div>

  );

}

export default Settings;