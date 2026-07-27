import api from "./api";

export async function getExpense() {
  return api.get("/expense/");
}

export async function addExpense(data: any) {
  return api.post("/expense/", data);
}

export async function updateExpense(id: number, data: any) {
  return api.put(`/expense/${id}/`, data);
}

export async function deleteExpense(id: number) {
  return api.delete(`/expense/${id}/`);
}