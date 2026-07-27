import api from "./api";

export const getBudgets = () => api.get("budget/");

export const addBudget = (data: any) =>
  api.post("budget/", data);

export const updateBudget = (id: number, data: any) =>
  api.put(`budget/${id}/`, data);

export const deleteBudget = (id: number) =>
  api.delete(`budget/${id}/`);