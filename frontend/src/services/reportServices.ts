import api from "./api";

export const getMonthlyReport = (
  month: number,
  year: number
) => {
  return api.get(
    `/reports/monthly/?month=${month}&year=${year}`
  );
};

export const getExpenseReport = (
  month: number,
  year: number
) => {
  return api.get(
    `/reports/expenses/?month=${month}&year=${year}`
  );
};

export const getSavingsReport = () => {
    return api.get("/reports/savings/");
};

export const getFinancialSummaryReport = () => {
    return api.get("/reports/summary/");
};

export const getExportReport = () => {
    return api.get("/reports/export/",{
    responseType: "blob"
    });
    
};