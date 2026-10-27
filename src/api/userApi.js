import apiClient from './client'

export const userApi = {
  getDashboard: () => apiClient.get('/user/dashboard'),
  getQuizHistory: (date) => apiClient.get('/user/quiz-history', { params: { date } }),
  addSchedule: (data) => apiClient.post('/user/schedule', data),
  deleteSchedule: (id) => apiClient.delete('/user/schedule/' + id),
  addAcquiredCertification: (data) => apiClient.post('/user/certifications', data),
  deleteAcquiredCertification: (id) => apiClient.delete('/user/certifications/' + id),
  getKakaoNotificationStatus: () => apiClient.get('/user/kakao-notification/status'),
  connectKakaoNotification: (data) => apiClient.post('/user/kakao-notification/connect', data),
  updateKakaoNotificationSettings: (data) => apiClient.post('/user/kakao-notification/settings', data)
}
