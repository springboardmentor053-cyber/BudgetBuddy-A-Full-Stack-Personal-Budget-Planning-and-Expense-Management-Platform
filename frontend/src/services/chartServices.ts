import api from "./api";

export const getExpenseChart = () => {
  return api.get("/expense/chart/");
};

export const getIncomeExpenseChart = () => {
  return api.get("/income/chart/");
};
export const getMonthlyComparison = () => {
  return api.get("/income/monthly-comparison/");
};

