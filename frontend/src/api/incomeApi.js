import api from "./axios";

export const getIncome = () =>
  api.get("income/");

export const addIncome = (data) =>
  api.post("income/", data);

export const updateIncome = (id, data) =>
  api.put(`income/${id}/`, data);

export const deleteIncome = (id) =>
  api.delete(`income/${id}/`);