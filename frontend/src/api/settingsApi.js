import axios from "axios";

// Base API URL (adjust base URL according to your environment configuration)
// ✅ Correct in Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create an Axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject the Auth Token into requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch the authenticated user's current settings/preferences.
 * GET /api/settings
 */
export const getSettings = async () => {
  return await apiClient.get("/settings");
};

/**
 * Update user settings (Dark mode, notifications, currency, language).
 * PUT /api/settings
 * @param {Object} settingsData - { notifications, dark_mode, currency, language }
 */
export const updateSettings = async (settingsData) => {
  return await apiClient.put("/settings", settingsData);
};

/**
 * Change user password.
 * POST /api/settings/change-password
 * @param {Object} passwordData - { old_password, new_password }
 */
export const changePassword = async (passwordData) => {
  return await apiClient.post("/settings/change-password", passwordData);
};

/**
 * Permanently delete the user's account.
 * DELETE /api/settings/account
 */
export const deleteAccount = async () => {
  return await apiClient.delete("/settings/account");
};

export default apiClient;