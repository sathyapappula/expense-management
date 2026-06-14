import client from './client'

export const budgetApi = {
  list: (params) => client.get('/budgets', { params }),
  getByMonth: (year, month) => client.get(`/budgets/month/${year}/${month}`),
  get: (id) => client.get(`/budgets/${id}`),
  create: (data) => client.post('/budgets', data),
  update: (id, data) => client.put(`/budgets/${id}`, data),
  delete: (id) => client.delete(`/budgets/${id}`),
}
