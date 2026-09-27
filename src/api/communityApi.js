import apiClient from './client'

export const communityApi = {
  getAllPosts: () => apiClient.get('/community/posts'),
  getPosts: () => apiClient.get('/community/posts'),
  getBestPosts: (sort = 'views') => apiClient.get('/community/posts/best', { params: { sort } }),
  getPostDetail: (id, userId) =>
    apiClient.get(`/community/posts/${id}`, {
      params: userId ? { userId } : {},
    }),
  getPost: (id, userId) =>
    apiClient.get(`/community/posts/${id}`, {
      params: userId ? { userId } : {},
    }),
  createPost: (formData) =>
    apiClient.post('/community/write', formData, {
      headers: { 'Content-Type': undefined },
    }),
  updatePost: (id, formData) =>
    apiClient.put(`/community/posts/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    }),
  deletePost: (id, userId) =>
    apiClient.delete(`/community/posts/${id}`, {
      params: userId ? { userId } : {},
    }),
  recommendPost: (id, params = {}) =>
    apiClient.post(
      `/community/posts/${id}/recommend`,
      null,
      {
        params: typeof params === 'object' ? params : (params ? { userId: params } : {}),
      }
    ),
  createComment: (payload) => apiClient.post('/community/comments', payload),
  getComments: (postId) => apiClient.get(`/community/posts/${postId}/comments`),
  getMyPosts: () => apiClient.get('/community/my-posts'),
  getLikedPosts: () => apiClient.get('/community/liked-posts'),
}
