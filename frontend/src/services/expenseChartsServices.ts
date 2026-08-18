import api from "./api";

export const getExpenseChart = () => {
  return api.get("/expense/chart/");
};