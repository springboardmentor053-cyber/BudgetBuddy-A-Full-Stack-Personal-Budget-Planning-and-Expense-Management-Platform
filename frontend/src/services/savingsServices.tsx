import api from "./api";

export const getSavingsGoals = () =>
  api.get("/savings/");

export const createSavingsGoal = (data: any) =>
  api.post("/savings/", data);

export const updateSavingsGoal = (
  id: number,
  data: any
) =>
  api.put(`/savings/${id}/`, data);

export const deleteSavingsGoal = (
  id: number
) =>
  api.delete(`/savings/${id}/`);

export const getSavingsProgress = (
  id: number
) =>
  api.get(`/savings/${id}/progress/`);
export const getSavingsDashboard = () => {
  return api.get("savings/dashboard/");
};