import apiClient from './client'

export const examApi = {
  getCerts: () => apiClient.get('/exams/certs'),
  getMockExam: (certId) => apiClient.get(`/exams/${certId}/mock`),
  saveHistory: (payload) => apiClient.post('/exams/save-history', payload),
  generateExplanations: (learnIds) => apiClient.post('/exams/explanations', learnIds),
  reportExplanation: (learnId) => apiClient.post(`/exams/${learnId}/report-explanation`),
  getAllSchedules: () => apiClient.get('/exams/locations/all-schedules'),
  searchLocations: (query) => apiClient.get('/exams/locations', { params: { query } }),
  nearbyLocations: (lat, lng, limit = 10) => apiClient.get('/exams/locations/near', { params: { lat, lng, limit } }),
}
