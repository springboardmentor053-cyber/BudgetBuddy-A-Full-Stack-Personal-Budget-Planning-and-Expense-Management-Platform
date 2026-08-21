import axios from "axios";

const api = axios.create({
  baseURL: "https://budgetbuddy-backend-itvi.onrender.com/api/",
});

export default api;