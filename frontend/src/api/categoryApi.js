// src/api/categoryApi.js
import axiosInstance from "./axios";

export const getExpenseCategories = (params = {}) => {
  return axiosInstance.get("categories/", { params });
};