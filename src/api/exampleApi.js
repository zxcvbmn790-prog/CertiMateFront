import apiClient from './client'

// 실제 도메인 API를 추가할 때 참고할 예시입니다. 백엔드의 ExampleController와 짝을 이룹니다.
export const exampleApi = {
  getAll: () => apiClient.get('/examples'),
  getById: (id) => apiClient.get(`/examples/${id}`),
  create: (payload) => apiClient.post('/examples', payload),
  update: (id, payload) => apiClient.put(`/examples/${id}`, payload),
  remove: (id) => apiClient.delete(`/examples/${id}`),
}
