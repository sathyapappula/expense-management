import client from './client'

export const loansApi = {
  list:   ()         => client.get('/assets/loans'),
  create: (data)     => client.post('/assets/loans', data),
  update: (id, data) => client.put(`/assets/loans/${id}`, data),
  delete: (id)       => client.delete(`/assets/loans/${id}`),
}

export const investmentsApi = {
  list:   (type)     => client.get('/assets/investments', { params: type ? { investment_type: type } : {} }),
  create: (data)     => client.post('/assets/investments', data),
  update: (id, data) => client.put(`/assets/investments/${id}`, data),
  delete: (id)       => client.delete(`/assets/investments/${id}`),
}

