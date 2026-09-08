// 실행: node src/utils/grading.test.js
// 프레임워크 없이 돌아간다. 채점이 틀리면 사용자에게 바로 잘못된 결과가 나가므로
// 최소한의 회귀 검사는 남겨둔다.
import assert from 'node:assert/strict'
import { isCorrectAnswer } from './grading.js'

const q = (options, answer) => ({ optionsArray: options, answer })

// 1) 기본: 정답 선택지를 고르면 정답
const 개념 = q(['시분할 시스템', '일괄 처리 시스템', '실시간 시스템', '분산 처리 시스템'], '일괄 처리 시스템')
assert.equal(isCorrectAnswer(개념, '2'), true, '정답을 골랐는데 오답 처리됨')
assert.equal(isCorrectAnswer(개념, '1'), false)
assert.equal(isCorrectAnswer(개념, '4'), false)

// 2) 회귀: 정답 텍스트가 숫자인 문항.
//    옛 코드는 `answer === userAnswer` 폴백 때문에 3번(값 "4")을 고르면
//    answer "3" 과 선택번호 "3" 이 맞아떨어져 정답으로 처리했다.
const 숫자 = q(['2', '3', '4', '5'], '3')
assert.equal(isCorrectAnswer(숫자, '2'), true, '값 "3"은 2번 선택지다')
assert.equal(isCorrectAnswer(숫자, '3'), false, '선택번호와 정답텍스트 충돌 회귀')

// 3) 회귀: 인덱스와 텍스트를 직접 비교하던 점수 계산 경로.
//    옛 computeResult 는 "2" === "일괄 처리 시스템" 을 비교해 항상 오답이었다.
assert.equal(isCorrectAnswer(개념, '2'), true)

// 4) 미응답·범위 밖·비정상 입력
assert.equal(isCorrectAnswer(개념, undefined), false)
assert.equal(isCorrectAnswer(개념, ''), false)
assert.equal(isCorrectAnswer(개념, '0'), false, '1-based 이므로 0은 없음')
assert.equal(isCorrectAnswer(개념, '9'), false, '범위 밖')
assert.equal(isCorrectAnswer(개념, 'abc'), false)

console.log('grading 테스트 통과')
