import axios from "axios";

const API = axios.create({
  baseURL: "https://budgetbuddy-a-full-stack-personal-budget-1hdo.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getBudgetAlerts = () => {
  return API.get("/budget/alerts/");
};