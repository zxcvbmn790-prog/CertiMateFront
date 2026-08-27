import apiClient from './client'

export const examApi = {
  getCerts: () => apiClient.get('/exams/certs'),
  getMockExam: (certId) => apiClient.get(`/exams/${certId}/mock`),
  saveHistory: (payload) => apiClient.post('/exams/save-history', payload),
  generateExplanations: (learnIds) => apiClient.post('/exams/explanations', learnIds),
}
