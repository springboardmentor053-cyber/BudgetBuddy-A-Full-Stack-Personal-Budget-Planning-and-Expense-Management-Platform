// src/api/axios.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://budgetbuddy-backend-xtl4.onrender.com/api/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Check all potential token keys stored during login
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No authentication token found in localStorage.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;