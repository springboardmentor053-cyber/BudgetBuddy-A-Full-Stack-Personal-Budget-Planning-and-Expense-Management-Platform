import api from "./axios";

// Fetch overall dashboard analytics
export const getAnalyticsDashboard = (params) => {
  return api.get("reports/summary/", { params });
};

// Main dashboard dataset
export const getDashboard = (params = {}) => {
  return api.get("reports/dashboard/", { params });
};

// API call for monthly trend chart
export const getMonthlyExpenseTrend = (params = {}) => {
  return api.get("reports/monthly-trend/", { params });
};

// File export (CSV, PDF, Excel)
export const exportReportFile = (format, month, year) => {
  const params = {
    export_format: format,
  };

  if (month && month !== "ALL") params.month = month;
  if (year) params.year = year;

  return api.get("reports/export-report/", {
    params,
    responseType: "blob",
  });
};