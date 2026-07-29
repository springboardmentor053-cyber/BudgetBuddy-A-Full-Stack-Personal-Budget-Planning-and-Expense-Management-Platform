import axios from "axios";

// Change this base URL to match your backend port/route
const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAsRead = async (id) => {
  const token = localStorage.getItem("token");
  return await axios.put(
    `${API_URL}/${id}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};