// import axios from "axios";

// const API_BASE = "http://127.0.0.1:8000/api";

// export const getDashboard = async () => {
//   const token = localStorage.getItem("access");
//   return axios.get(`${API_BASE}/dashboard/`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

import api from "./axios";

export const getDashboard = () => {
  return api.get("dashboard/");
};