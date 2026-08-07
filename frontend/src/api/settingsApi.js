import axios from "axios";

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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
    // Check both 'token' and 'access_token' in case of naming variations
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch the authenticated user's current settings/preferences.
 * GET /api/users/settings/
 */
export const getSettings = async () => {
  // Fixed: Replaced `axios.get` with `apiClient.get` so the Auth token is sent
  return await apiClient.get("/users/settings/");
};

/**
 * Update user settings (Dark mode, notifications, currency, language).
 * PUT /api/users/settings/
 * @param {Object} settingsData - { notifications, dark_mode, currency, language }
 */
export const updateSettings = async (settingsData) => {
  return await apiClient.put("/users/settings/", settingsData);
};

/**
 * Change user password.
 * POST /api/users/settings/change-password/
 * @param {Object} passwordData - { old_password, new_password }
 */
export const changePassword = async (passwordData) => {
  return await apiClient.post("/users/settings/change-password/", passwordData);
};

/**
 * Permanently delete the user's account.
 * DELETE /api/users/settings/account/
 */
export const deleteAccount = async () => {
  return await apiClient.delete("/users/settings/account/");
};

export default apiClient;