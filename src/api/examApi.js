import apiClient from './client'

export const examApi = {
  getMockExam: (certId) => apiClient.get(`/exams/${certId}/mock`),
  saveHistory: (payload) => apiClient.post('/exams/save-history', payload),
}
