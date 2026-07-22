import api from "./axios";

export const getExpenseCategories = () =>
 api.get("expenses/category-summary/");