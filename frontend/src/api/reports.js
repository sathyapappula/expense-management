import client from './client'

export const reportsApi = {
  download: (params) =>
    client.get('/reports/download', {
      params,
      responseType: 'blob',
    }),
}
