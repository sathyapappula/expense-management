import client from './client'

export const aiApi = {
  ask: (question) => client.post('/ai/ask', { question }),
}
