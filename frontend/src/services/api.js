import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to automatically handle 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (username, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/token/`, { username, password });
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },
  register: async (username, email, password) => {
    const res = await axios.post(`${API_BASE_URL}/api/users/register/`, {
      username,
      email,
      password,
    });
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  getProfile: () => api.get('/api/users/profile/').then((res) => res.data),
  updateProfile: (data) => api.put('/api/users/profile/', data).then((res) => res.data),
};

// Expenses services
export const expenseService = {
  getAll: () => api.get('/api/expenses/').then((res) => res.data),
  create: (data) => api.post('/api/expenses/', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/expenses/${id}/`, data).then((res) => res.data),
  delete: (id) => api.delete(`/api/expenses/${id}/`).then((res) => res.data),
};

// Income services
export const incomeService = {
  getAll: () => api.get('/api/income/').then((res) => res.data),
  create: (data) => api.post('/api/income/', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/income/${id}/`, data).then((res) => res.data),
  delete: (id) => api.delete(`/api/income/${id}/`).then((res) => res.data),
};

// Budgets services
export const budgetService = {
  getAll: () => api.get('/api/budgets/').then((res) => res.data),
  create: (data) => api.post('/api/budgets/', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/budgets/${id}/`, data).then((res) => res.data),
  delete: (id) => api.delete(`/api/budgets/${id}/`).then((res) => res.data),
};

// Savings Goals services
export const savingsService = {
  getAll: () => api.get('/api/savings/').then((res) => res.data),
  create: (data) => api.post('/api/savings/', data).then((res) => res.data),
  update: (id, data) => api.put(`/api/savings/${id}/`, data).then((res) => res.data),
  delete: (id) => api.delete(`/api/savings/${id}/`).then((res) => res.data),
};

// Notifications services
export const notificationService = {
  getAll: () => api.get('/api/notifications/').then((res) => res.data),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read/`).then((res) => res.data),
  delete: (id) => api.delete(`/api/notifications/${id}/`).then((res) => res.data),
};

// Reports and Dashboard services
export const reportService = {
  getDashboardData: () => api.get('/api/reports/dashboard/').then((res) => res.data),
  getHistory: () => api.get('/api/reports/history/').then((res) => res.data),
  exportReport: (format, filterType, startDate, endDate) => {
    return api.get('/api/reports/export/', {
      params: { export: format, filter_type: filterType, start_date: startDate, end_date: endDate },
      responseType: format === 'csv' ? 'blob' : 'json'
    }).then((res) => res.data);
  },
  getCombinedReport: (filterType, startDate, endDate) => {
    return api.get('/api/reports/financial-summary-report/', {
      params: { filter_type: filterType, start_date: startDate, end_date: endDate }
    }).then((res) => res.data);
  }
};

// AI Chatbot services
export const aiService = {
  chat: (message) => api.post('/api/ai/chat/', { message }).then((res) => res.data),
};

export default api;
