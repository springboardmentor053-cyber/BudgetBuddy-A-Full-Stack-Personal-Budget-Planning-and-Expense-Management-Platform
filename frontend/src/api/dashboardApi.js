import axiosInstance from "./axios";

export const getDashboard = (params = {}) => {
  // Updated URL to include 'reports/' prefix
  axiosInstance.get("analytics/dashboard/", { params })
  return axiosInstance.get("reports/dashboard/", { params });

};