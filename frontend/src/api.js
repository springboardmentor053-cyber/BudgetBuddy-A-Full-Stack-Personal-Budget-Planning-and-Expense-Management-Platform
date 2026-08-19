import axios from 'axios';

const API = axios.create({
  baseURL: 'https://budget-buddy-v02g.onrender.com/api/',
});

// Automatically add JWT access token to headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Log detailed Django response errors automatically
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else {
      console.error('Network/CORS Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;