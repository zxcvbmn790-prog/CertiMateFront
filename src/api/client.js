import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  withCredentials: true, // JWT가 httpOnly 쿠키로 오가므로 쿠키 자동 전송 필요
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default apiClient
