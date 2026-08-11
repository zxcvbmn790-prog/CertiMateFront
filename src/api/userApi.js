import apiClient from './client'

export const userApi = {
  getDashboard: () => apiClient.get('/user/dashboard'),
  getQuizHistory: (date) => apiClient.get('/user/quiz-history', { params: { date } }),
}
