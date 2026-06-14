import client from './client'

export const cropsApi = {
  list:           ()                            => client.get('/crops'),
  get:            (id)                          => client.get(`/crops/${id}`),
  create:         (data)                        => client.post('/crops', data),
  update:         (id, data)                    => client.put(`/crops/${id}`, data),
  remove:         (id)                          => client.delete(`/crops/${id}`),
  addExpense:     (cropId, data)                => client.post(`/crops/${cropId}/expenses`, data),
  deleteExpense:  (cropId, expenseId)           => client.delete(`/crops/${cropId}/expenses/${expenseId}`),
}
