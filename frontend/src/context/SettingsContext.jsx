import { createContext, useContext, useState, useEffect } from "react";
import { getSettings, updateSettings } from "../api/settingsApi";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem("theme") === "dark",
    notifications: true,
    currency: "INR",
    language: "English",
  });

  const [loading, setLoading] = useState(true);

  // Load preferences from API on app load
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res.data) {
        const fetchedSettings = {
          darkMode: res.data.dark_mode ?? true,
          notifications: res.data.notifications ?? true,
          currency: res.data.currency || "INR",
          language: res.data.language || "English",
        };

        setSettings(fetchedSettings);
        applyTheme(fetchedSettings.darkMode);
      }
    } catch (error) {
      console.warn("Using local settings fallback:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to sync dark class on <html> element
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Update Settings Globally
  const saveGlobalSettings = async (newSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.darkMode);

    // Save to backend
    try {
      await updateSettings({
        dark_mode: newSettings.darkMode,
        notifications: newSettings.notifications,
        currency: newSettings.currency,
        language: newSettings.language,
      });
    } catch (err) {
      console.error("Failed to sync settings with backend:", err);
    }
  };

  // Global Money Formatter Tool (Converts numbers to ₹, $, €, £)
  const formatMoney = (amount) => {
    const num = Number(amount || 0);
    const currencyMap = {
      INR: { locale: "en-IN", currency: "INR" },
      USD: { locale: "en-US", currency: "USD" },
      EUR: { locale: "de-DE", currency: "EUR" },
      GBP: { locale: "en-GB", currency: "GBP" },
    };

    const config = currencyMap[settings.currency] || currencyMap.INR;

    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        saveGlobalSettings,
        formatMoney,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);