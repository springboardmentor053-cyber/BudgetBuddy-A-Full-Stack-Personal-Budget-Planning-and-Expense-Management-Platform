import api from '../api/axios';

const EXPENSES_ENDPOINT = '/api/expenses/tracking/';

export const expenseService = {
  async getExpenses() {
    const response = await api.get(EXPENSES_ENDPOINT);
    return response.data;
  },

  async createExpense(payload) {
    const response = await api.post(EXPENSES_ENDPOINT, payload);
    return response.data;
  },

  async updateExpense(id, payload) {
    const response = await api.put(`${EXPENSES_ENDPOINT}${id}/`, payload);
    return response.data;
  },
};
