import api from "./axios";

export const getSavings = () =>
  api.get("savings/");

export const addSavings = (data) =>
  api.post("savings/", data);

export const updateSavings = (id, data) =>
  api.put(`savings/${id}/`, data);

export const deleteSavings = (id) =>
  api.delete(`savings/${id}/`);

export const getProgress = () =>
  api.get("savings/progress/");