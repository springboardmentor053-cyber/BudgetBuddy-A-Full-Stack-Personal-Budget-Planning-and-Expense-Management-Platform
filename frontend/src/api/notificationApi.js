import axios from "axios";

// Change this base URL to match your backend port/route
const API_URL = `${
  import.meta.env.VITE_API_URL ||
  "https://budgetbuddy-backend-xtl4.onrender.com/api"
}/notifications/`;
export const getNotifications = async () => {
  const token = localStorage.getItem("access");
  return await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAsRead = async (id) => {
  const token = localStorage.getItem("access");
  return await axios.post(
    `${API_URL}${id}/mark-read/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const markAllAsRead = async () => {
  const token = localStorage.getItem("access");
  return await axios.post(
    `${API_URL}mark-all-read/`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteNotification = async (id) => {
  const token = localStorage.getItem("access");
  return await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};