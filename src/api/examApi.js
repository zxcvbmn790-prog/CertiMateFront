import apiClient from './client'

export const examApi = {
  getMockExam: (certId) => apiClient.get(`/exams/${certId}/mock`),
  saveHistory: (payload) => apiClient.post('/exams/save-history', payload),
  // 한 문제씩 풀기(무한 학습) 모드: 랜덤 1문제 출제. excludeIds는 쉼표로 구분된 learnId 문자열
  getPracticeQuestion: (certId, excludeIds) =>
    apiClient.get(`/exams/${certId}/practice`, { params: excludeIds ? { excludeIds } : {} }),
}
