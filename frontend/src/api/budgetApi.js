import api from "./axios";

export const getBudgets = () => api.get("budgets/");

export const addBudget = (data) =>
    api.post("budgets/", data);

export const updateBudget = (id, data) =>
    api.put(`budgets/${id}/`, data);

export const deleteBudget = (id) =>
    api.delete(`budgets/${id}/`);

