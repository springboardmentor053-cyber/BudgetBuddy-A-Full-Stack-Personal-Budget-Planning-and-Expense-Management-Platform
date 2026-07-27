import api from "./api";

export function getDashboardSummary() {
  return api.get("/income/dashboard/");
}