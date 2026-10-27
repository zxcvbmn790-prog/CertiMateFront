import apiClient from './client'

export const jobApi = {
  getRecommendations: (params) => apiClient.get('/jobs/recommendations', { params })
}
