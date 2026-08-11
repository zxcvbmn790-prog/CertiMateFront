import apiClient from './client'

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  kakaoLogin: (code) => apiClient.post('/auth/kakao', { code }),
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (payload) => apiClient.put('/auth/me', payload),
  withdraw: () => apiClient.delete('/auth/me'),
}
