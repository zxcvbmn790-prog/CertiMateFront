import apiClient from './client'

export const communityApi = {
  getMyPosts: () => apiClient.get('/community/my-posts'),
  getLikedPosts: () => apiClient.get('/community/liked-posts'),
}
