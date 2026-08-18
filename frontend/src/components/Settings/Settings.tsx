import { useEffect, useState } from "react";
import {
  FaUser,
  FaBell,
  FaCalculator,
  FaMoon,
  FaMoneyBillWave,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Settings() {
  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notificationsEnabled") !== "false"
  );

  const [calculator, setCalculator] = useState(
    localStorage.getItem("calculatorEnabled") !== "false"
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "INR"
  );

  const [showCalculator, setShowCalculator] = useState(false);

  const [display, setDisplay] = useState("0");

  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  // =========================
  // NOTIFICATIONS
  // =========================

  function toggleNotifications() {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "notificationsEnabled",
      String(newValue)
    );
  }

  // =========================
  // CALCULATOR
  // =========================

  function toggleCalculator() {
    const newValue = !calculator;

    setCalculator(newValue);

    localStorage.setItem(
      "calculatorEnabled",
      String(newValue)
    );

    if (!newValue) {
      setShowCalculator(false);
    }
  }

  function pressCalculator(value: string) {
    if (value === "C") {
      setDisplay("0");
      return;
    }

    if (value === "=") {
      try {
        // Simple calculator evaluation
        const result = Function(
          `"use strict"; return (${display})`
        )();

        setDisplay(String(result));
      } catch {
        setDisplay("Error");
      }

      return;
    }

    if (display === "0" || display === "Error") {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  }

  // =========================
  // CURRENCY
  // =========================

  async function handleCurrencyChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newCurrency = e.target.value;

    setCurrency(newCurrency);

    localStorage.setItem("currency", newCurrency);

    try {
      await api.put("/profile/", {
        currency: newCurrency,
      });

      console.log("Currency updated:", newCurrency);
    } catch (error) {
      console.error("Currency update failed:", error);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="p-10 min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Settings
        </h1>

        <p className="text-gray-500 dark:text-gray-300 mt-2">
          Manage your BudgetBuddy preferences
        </p>
      </div>

      {/* ACCOUNT */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          👤 Account
        </h2>

        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >

          <div className="flex items-center gap-4">

            <FaUser className="text-indigo-600" />

            <div className="text-left">

              <p className="font-semibold text-gray-800 dark:text-white">
                Go to Profile
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-300">
                View and manage your profile
              </p>

            </div>

          </div>

          <FaChevronRight className="text-gray-400" />

        </button>

      </div>

      {/* NOTIFICATIONS */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          🔔 Notifications
        </h2>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <FaBell className="text-blue-600" />

            <div>

              <p className="font-semibold text-gray-800 dark:text-white">
                Enable Notifications
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-300">
                Receive budget and expense alerts
              </p>

            </div>

          </div>

          <button
            onClick={toggleNotifications}
            className={`w-14 h-7 rounded-full transition ${
              notifications
                ? "bg-indigo-600"
                : "bg-gray-300"
            }`}
          >

            <div
              className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                notifications
                  ? "translate-x-7"
                  : "translate-x-0"
              }`}
            />

          </button>

        </div>

      </div>

      {/* CALCULATOR */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          🧮 Calculator
        </h2>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <FaCalculator className="text-green-600" />

            <div>

              <p className="font-semibold text-gray-800 dark:text-white">
                Enable Calculator
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-300">
                Use the BudgetBuddy financial calculator
              </p>

            </div>

          </div>

          <button
            onClick={toggleCalculator}
            className={`w-14 h-7 rounded-full transition ${
              calculator
                ? "bg-indigo-600"
                : "bg-gray-300"
            }`}
          >

            <div
              className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                calculator
                  ? "translate-x-7"
                  : "translate-x-0"
              }`}
            />

          </button>

        </div>

        {calculator && (

          <button
            onClick={() => setShowCalculator(true)}
            className="mt-5 w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-4 rounded-xl text-left flex justify-between"
          >

            <span className="font-semibold text-gray-800 dark:text-white">
              Open Calculator
            </span>

            <FaChevronRight className="text-gray-400" />

          </button>

        )}

      </div>

      {/* APPEARANCE */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          🎨 Appearance
        </h2>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <FaMoon className="text-purple-600" />

            <div>

              <p className="font-semibold text-gray-800 dark:text-white">
                Dark Mode
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-300">
                Switch between light and dark theme
              </p>

            </div>

          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-7 rounded-full transition ${
              darkMode
                ? "bg-indigo-600"
                : "bg-gray-300"
            }`}
          >

            <div
              className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                darkMode
                  ? "translate-x-7"
                  : "translate-x-0"
              }`}
            />

          </button>

        </div>

      </div>

      {/* FINANCE */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">

        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
          💰 Finance Preferences
        </h2>

        <div className="flex items-center gap-4">

          <FaMoneyBillWave className="text-yellow-600" />

          <div className="flex-1">

            <p className="font-semibold text-gray-800 dark:text-white">
              Default Currency
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Currency used throughout BudgetBuddy
            </p>

          </div>

          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="border rounded-xl px-4 py-2 bg-white dark:bg-gray-700 dark:text-white"
          >

            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>

          </select>

        </div>

      </div>

      {/* CALCULATOR MODAL */}

      {showCalculator && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                🧮 Calculator
              </h2>

              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>

            </div>

            {/* DISPLAY */}

            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4 text-right text-2xl font-semibold text-gray-800 dark:text-white overflow-hidden">
              {display}
            </div>

            {/* BUTTONS */}

            <div className="grid grid-cols-4 gap-2">

              {[
                "7",
                "8",
                "9",
                "/",
                "4",
                "5",
                "6",
                "*",
                "1",
                "2",
                "3",
                "-",
                "0",
                ".",
                "C",
                "+",
              ].map((value) => (

                <button
                  key={value}
                  onClick={() => pressCalculator(value)}
                  className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-gray-800 dark:text-white"
                >
                  {value}
                </button>

              ))}

              <button
                onClick={() => pressCalculator("=")}
                className="col-span-4 p-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                =
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;