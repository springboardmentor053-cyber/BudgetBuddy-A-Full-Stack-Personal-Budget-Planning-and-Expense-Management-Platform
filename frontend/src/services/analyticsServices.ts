import api from "./api";

export const getDashboardAnalytics = () => {
  return api.get("/analytics/dashboard/");
};