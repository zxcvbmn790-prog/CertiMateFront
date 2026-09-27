// 문제 채점 비교. 화면 여러 곳(점수 계산·OMR 표시·정답 배지·오답노트 저장)에서
// 반드시 이 함수만 쓴다.
//
// 규약:
//   userAnswer  = 사용자가 고른 '1-based 인덱스 문자열'  예: "2"
//   question.answer = 정답 '선택지 텍스트'                예: "일괄 처리 시스템"
//
// 예전에는 answer 에 인덱스가 저장된 행과 텍스트가 저장된 행이 DB에 섞여 있어
// 코드가 `answer === 선택텍스트 || answer === 선택번호` 로 두 규약을 함께 받았다.
// 그 폴백은 정답 텍스트가 숫자일 때(예: answer "3") 선택 번호 3과 충돌해
// 엉뚱한 선택지를 정답으로 처리했다. 2026-09-08에 DB를 텍스트 규약으로
// 통일했으므로 비교는 한 가지로 충분하다.
export const isCorrectAnswer = (question, userAnswer) => {
  if (!userAnswer) return false
  const picked = question?.optionsArray?.[parseInt(userAnswer, 10) - 1]
  return picked !== undefined && String(picked) === String(question.answer)
}
