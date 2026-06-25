import client from './client'

const BASE = '/credit-cards'

export const creditCardsApi = {
  // Cards
  listCards:  ()           => client.get(BASE),
  createCard: (data)       => client.post(BASE, data),
  updateCard: (id, data)   => client.put(`${BASE}/${id}`, data),
  deleteCard: (id)         => client.delete(`${BASE}/${id}`),
  // Bills
  listBills:  (cardId)     => client.get(`${BASE}/bills`, { params: cardId ? { card_id: cardId } : {} }),
  addBill:    (data)       => client.post(`${BASE}/bills`, data),
  updateBill: (id, data)   => client.put(`${BASE}/bills/${id}`, data),
  deleteBill: (id)         => client.delete(`${BASE}/bills/${id}`),
  payBill:    (id, data)   => client.post(`${BASE}/bills/${id}/pay`, data),
}
