import apiClient from './client'

export const communityApi = {
  getPosts: () => apiClient.get('/community/posts'),
  getPost: (id) => apiClient.get(`/community/posts/${id}`),
  createPost: (formData) => apiClient.post('/community/write', formData, { headers: { 'Content-Type': undefined } }),
  getMyPosts: () => apiClient.get('/community/my-posts'),
  getLikedPosts: () => apiClient.get('/community/liked-posts'),
}
