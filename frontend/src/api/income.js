import client from './client'

export const incomeApi = {
  list: (params) => client.get('/income', { params }),
  get: (id) => client.get(`/income/${id}`),
  create: (data) => client.post('/income', data),
  update: (id, data) => client.put(`/income/${id}`, data),
  delete: (id) => client.delete(`/income/${id}`),
}
