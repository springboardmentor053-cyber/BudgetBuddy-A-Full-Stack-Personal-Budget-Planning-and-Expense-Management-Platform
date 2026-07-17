import api from '../api/axios';

export const incomeService = {
  async getIncomes() {
    const response = await api.get('/api/incomes/');
    return response.data;
  },

  async createIncome(payload) {
    const response = await api.post('/api/incomes/', payload);
    return response.data;
  },

  async getSummary() {
    const response = await api.get('/api/summary/');
    return response.data;
  },
};
