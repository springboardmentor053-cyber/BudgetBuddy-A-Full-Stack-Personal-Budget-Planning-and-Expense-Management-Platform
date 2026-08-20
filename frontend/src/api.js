import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
});


// ======================================
// Add JWT Token to Every Request
// ======================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ======================================
// Handle Expired / Invalid Token
// ======================================

api.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // Prevent redirect loop if already on login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }

);


export default api;