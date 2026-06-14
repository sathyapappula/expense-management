import client from './client'

export const expenseApi = {
  list: (params) => client.get('/expenses', { params }),
  get: (id) => client.get(`/expenses/${id}`),
  create: (data) => client.post('/expenses', data),
  update: (id, data) => client.put(`/expenses/${id}`, data),
  delete: (id) => client.delete(`/expenses/${id}`),
}
