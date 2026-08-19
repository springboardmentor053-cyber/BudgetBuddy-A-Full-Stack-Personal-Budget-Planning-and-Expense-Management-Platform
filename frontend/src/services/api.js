import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://budgetbuddy-2-3k0o.onrender.com/api/';

// Create an axios instance pointing to your Django backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 📤 1. REQUEST INTERCEPTOR: Automatically injects JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 📥 2. RESPONSE INTERCEPTOR: Handles Expiration (401) & Auto-Refresh
api.interceptors.response.use(
  (response) => response, // If the request succeeds, just pass it through
  async (error) => {
    const originalRequest = error.config;

    // If backend returns 401 (Unauthorized) and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Attempt to get a fresh access token using the refresh token
        const res = await axios.post(`${API_BASE_URL}auth/login/refresh/`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          // 1. Save the brand new token
          localStorage.setItem('token', res.data.access);
          
          // 2. Inject it back into our original failed request headers
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          
          // 3. Retry the original request automatically!
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If the refresh token is also expired/invalid, wipe storage and boot to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
