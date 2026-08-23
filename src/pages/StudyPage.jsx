import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Cpu, Timer, CheckCircle, XCircle, Search, BookOpen,
  RotateCcw, ChevronLeft, ChevronRight, Check, Zap, MapPin, Repeat
} from 'lucide-react'
import { examApi } from '../api/examApi'

const StudyPage = () => {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCert, setSelectedCert] = useState(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isGraded, setIsGraded] = useState(false)
  const [isRetakeMode, setIsRetakeMode] = useState(false)
  const [mode, setMode] = useState('exam') // 'exam'(모의고사) | 'practice'(한 문제씩 풀기)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // 타이머 상태 (90분 = 5400초)
  const [timeLeft, setTimeLeft] = useState(5400)

  // 한 문제씩 풀기(무한 학습) 모드 상태: 문제 1개 -> 즉시 채점/해설 -> 다음 문제를 반복한다
  const [practiceQuestion, setPracticeQuestion] = useState(null)
  const [practiceUserAnswer, setPracticeUserAnswer] = useState(null) // 선택한 보기 번호(문자열)
  const [practiceSeenIds, setPracticeSeenIds] = useState([])
  const [practiceStats, setPracticeStats] = useState({ solved: 0, correct: 0 })
  const [isPracticeLoading, setIsPracticeLoading] = useState(false)
  const [practiceError, setPracticeError] = useState(null)

  // 리테이크 초기화 로직
  useEffect(() => {
    if (location.state && location.state.retakeSession) {
      const session = location.state.retakeSession

      const parsedData = session.records.map(q => ({
        learnId: q.learnId,
        question: q.question,
        options: q.options,
        optionsArray: JSON.parse(q.options),
        answer: q.correctAnswer,
        explanation: q.explanation
      }))

      setQuestions(parsedData)
      setIsStarted(true)
      setIsGraded(false)
      setUserAnswers({})
      setCurrentIndex(0)
      setTimeLeft(5400) // 90 mins
      setIsRetakeMode(true)
      setSelectedCert({ id: 0, name: `[오답 다시풀기] ${session.timeLabel} 회차`, category: '오답노트', questions: parsedData.length, difficulty: 'N/A' })
    } else if (location.state && location.state.viewNotesSession) {
      // 오답노트 보기
      const session = location.state.viewNotesSession

      const parsedData = session.records.map(q => ({
        learnId: q.learnId,
        question: q.question,
        options: q.options,
        optionsArray: JSON.parse(q.options),
        answer: q.correctAnswer,
        explanation: q.explanation
      }))

      // 이미 푼 기록 복원
      const answers = {}
      session.records.forEach(q => {
        answers[q.learnId] = q.userAnswer
      })

      setQuestions(parsedData)
      setIsStarted(true)
      setIsGraded(true)
      setUserAnswers(answers)
      setCurrentIndex(0)
      setTimeLeft(0)
      setIsRetakeMode(false)
      setSelectedCert({ id: 0, name: `[오답노트] ${session.timeLabel} 회차`, category: '오답노트', questions: parsedData.length, difficulty: 'N/A' })
    }
  }, [location.state])

  const certifications = [
    { id: 1, name: '정보처리산업기사', category: '국가기술', questions: 60, difficulty: 'Level 3', match: 98 },
    { id: 2, name: 'SQLD (개발자)', category: '민간자격', questions: 50, difficulty: 'Level 2', match: 85 },
    { id: 3, name: '리눅스마스터 2급', category: '국가기술', questions: 80, difficulty: 'Level 2', match: 70 },
    { id: 4, name: '네트워크관리사 2급', category: '민간자격', questions: 50, difficulty: 'Level 2', match: 65 },
    { id: 5, name: '데이터분석준전문가(ADsP)', category: '민간자격', questions: 50, difficulty: 'Level 3', match: 80 }
  ]

  const filteredCerts = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 타이머 카운트다운 로직
  useEffect(() => {
    if (isStarted && !isGraded && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !isGraded) {
      alert('시험 시간이 종료되어 자동으로 답안이 제출됩니다.')
      submitExam()
    }
  }, [isStarted, isGraded, timeLeft])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startExam = async () => {
    if (!selectedCert) return
    setIsLoading(true)

    try {
      const res = await examApi.getMockExam(selectedCert.id)
      const data = res.data

      const parsedData = data.map(q => ({
        ...q,
        optionsArray: JSON.parse(q.options)
      }))

      setQuestions(parsedData)
      setMode('exam')
      setIsStarted(true)
      setIsGraded(false)
      setIsRetakeMode(false)
      setUserAnswers({})
      setCurrentIndex(0)
      setTimeLeft(5400)
    } catch (error) {
      console.error('문제 로딩 실패:', error)
      alert('백엔드 서버와 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnswer = (learnId, value) => {
    if (isGraded) return
    setUserAnswers(prev => ({ ...prev, [learnId]: value }))

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
    }
  }

  const submitExam = async () => {
    if (isGraded) return

    if (Object.keys(userAnswers).length < questions.length && timeLeft > 0) {
      if (!window.confirm(`아직 풀지 않은 문제가 있습니다. (${Object.keys(userAnswers).length}/${questions.length})\n그래도 제출하시겠습니까?`)) return
    }

    setIsGraded(true)
    setCurrentIndex(0)

    const historyPayload = questions.map(q => {
      const uAnswer = userAnswers[q.learnId]
      let isCorrect = false
      if (uAnswer) {
        if (Array.isArray(q.answer)) {
          isCorrect = JSON.stringify(q.answer) === JSON.stringify(uAnswer)
        } else {
          const uAnswerText = q.optionsArray[parseInt(uAnswer) - 1]
          isCorrect = String(q.answer) === String(uAnswerText) || String(q.answer) === String(uAnswer)
        }
      }
      return {
        learnId: q.learnId,
        userAnswer: uAnswer || '',
        isCorrect: isCorrect
      }
    })

    if (isRetakeMode) {
      alert('채점이 완료되었습니다. (복습 모드에서는 결과가 저장되지 않습니다.)')
      return
    }

    try {
      await examApi.saveHistory(historyPayload)
      alert('수고하셨습니다! 결과가 오답노트에 저장되었습니다.')
    } catch (error) {
      console.error('오답노트 저장 실패:', error)
    }
  }

  const goToNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  // 한 문제씩 풀기 모드: 랜덤 1문제를 가져온다 (직전에 풀었던 문제는 제외)
  const fetchPracticeQuestion = async (certId, excludeIds) => {
    setIsPracticeLoading(true)
    setPracticeError(null)
    setPracticeUserAnswer(null)

    try {
      const res = await examApi.getPracticeQuestion(certId, excludeIds.slice(-10).join(','))
      const q = res.data
      if (!q) {
        setPracticeQuestion(null)
        setPracticeError('등록된 문제가 없습니다.')
      } else {
        setPracticeQuestion({ ...q, optionsArray: JSON.parse(q.options) })
      }
    } catch (error) {
      console.error('연습 문제 로딩 실패:', error)
      setPracticeQuestion(null)
      setPracticeError('백엔드 서버와 연결할 수 없습니다.')
    } finally {
      setIsPracticeLoading(false)
    }
  }

  const startPractice = async () => {
    if (!selectedCert) return
    setMode('practice')
    setIsStarted(true)
    setPracticeStats({ solved: 0, correct: 0 })
    setPracticeSeenIds([])
    await fetchPracticeQuestion(selectedCert.id, [])
  }

  // 보기를 클릭하면 그 자리에서 바로 채점하고 해설을 보여준다 (답 자체가 이미 클라이언트에 있으므로 즉시 판정)
  const handlePracticeSelect = (optionNumber) => {
    if (practiceUserAnswer || !practiceQuestion) return
    setPracticeUserAnswer(optionNumber)

    const q = practiceQuestion
    const uAnswerText = q.optionsArray[parseInt(optionNumber) - 1]
    const isCorrect = String(q.answer) === String(uAnswerText) || String(q.answer) === String(optionNumber)

    setPracticeStats(prev => ({ solved: prev.solved + 1, correct: prev.correct + (isCorrect ? 1 : 0) }))

    examApi.saveHistory([{ learnId: q.learnId, userAnswer: optionNumber, isCorrect }])
      .catch(error => console.error('오답노트 저장 실패:', error))
  }

  const handleNextPractice = () => {
    if (!practiceQuestion) return
    const nextSeen = [...practiceSeenIds, practiceQuestion.learnId].slice(-10)
    setPracticeSeenIds(nextSeen)
    fetchPracticeQuestion(selectedCert.id, nextSeen)
  }

  // ==========================================
  // [1단계 화면] CBT 모의고사 종목 검색
  // ==========================================
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#EAECEF] font-sans text-[#4A4F58]">
        {/* Hero Section */}
        <header className="relative py-24 px-6 bg-white border-b border-gray-200 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-[#3478B8]/5 px-4 py-2 rounded-full mb-8 border border-[#3478B8]/10">
              <Cpu size={14} className="text-[#3478B8]" />
              <span className="text-[10px] font-black text-[#3478B8] uppercase tracking-widest">AI Mock Exam System</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-8 leading-[1.15]">
              성찬님을 위한, <br />
              <span className="text-[#3478B8]">실전 AI 모의고사</span>
            </h1>
            <p className="text-gray-400 text-lg mb-12 font-medium max-w-2xl mx-auto">
              실제 시험과 동일한 환경에서 실력을 점검하고 취약점을 파악하세요.
            </p>

            {/* 통합 검색창 */}
            <div className="relative max-w-3xl mx-auto flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden border border-gray-100 bg-white">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="학습할 자격증 명칭을 검색합니다 (예: 정보처리, SQLD...)"
                  className="w-full p-6 pl-14 outline-none text-base font-medium placeholder:text-gray-300"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
          {/* 자격증 리스트 그리드 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCerts.map((cert) => {
              const isSelected = selectedCert?.id === cert.id
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-8 rounded-[24px] border-2 transition-all cursor-pointer group hover:shadow-xl hover:shadow-[#3478B8]/5 bg-white
                    ${isSelected ? 'border-[#3478B8] shadow-lg shadow-[#3478B8]/10' : 'border-gray-100 hover:border-[#3478B8]'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex space-x-2">
                      <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg border uppercase tracking-tighter
                        ${isSelected ? 'bg-[#3478B8] text-white border-[#3478B8]' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                      >
                        #{cert.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-black ${isSelected ? 'text-[#3478B8]' : 'text-[#3BAA7D]'}`}>{cert.match}% Match</span>
                    </div>
                  </div>
                  <h4 className={`text-2xl font-black mb-3 transition-colors ${isSelected ? 'text-[#3478B8]' : 'group-hover:text-[#3478B8]'}`}>{cert.name}</h4>
                  <div className="flex items-center text-xs text-gray-400 font-bold space-x-4">
                    <span className="flex items-center"><BookOpen size={14} className="mr-1.5 text-gray-300" /> {cert.difficulty}</span>
                    <span className="flex items-center"><MapPin size={14} className="mr-1.5 text-gray-300" /> 총 {cert.questions}문항</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              disabled={!selectedCert || isLoading}
              onClick={startPractice}
              className={`md:w-72 flex items-center justify-center py-5 rounded-[24px] font-black text-lg transition-all border-2
                ${selectedCert ? 'border-[#3478B8] text-[#3478B8] bg-white hover:bg-[#3478B8]/5' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Repeat size={20} className="mr-2" /> 한 문제씩 풀기
            </button>
            <button
              disabled={!selectedCert || isLoading}
              onClick={startExam}
              className={`flex-1 py-5 rounded-[24px] font-black text-lg transition-all shadow-xl
                ${selectedCert ? 'bg-[#3478B8] text-white shadow-[#3478B8]/20 hover:bg-[#2e69a3]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
            >
              {isLoading ? '시험지 준비 중...' : (selectedCert ? `"${selectedCert.name}" 모의고사 시작하기` : '응시할 종목을 선택해 주세요')}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ==========================================
  // [한 문제씩 풀기 모드] 문제 1개 -> 즉시 채점/해설 -> 다음 문제를 무한 반복
  // ==========================================
  if (mode === 'practice') {
    const accuracy = practiceStats.solved > 0 ? Math.round((practiceStats.correct / practiceStats.solved) * 100) : 0
    const isAnswered = Boolean(practiceUserAnswer)
    const pq = practiceQuestion

    return (
      <div className="min-h-screen bg-[#EAECEF] font-sans text-[#4A4F58] py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          <header className="flex items-center justify-between bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsStarted(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-full transition-colors border border-gray-100"
              >
                <RotateCcw size={18} />
              </button>
              <div>
                <span className="flex items-center text-[10px] font-black text-[#3478B8] uppercase tracking-widest mb-1">
                  <Repeat size={12} className="mr-1.5" /> 한 문제씩 풀기
                </span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedCert.name}</h2>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-gray-400 tracking-tighter mb-1.5">
                {practiceStats.solved}문제 풀이
              </div>
              <div className="text-lg font-black text-[#3BAA7D]">정답률 {accuracy}%</div>
            </div>
          </header>

          {isPracticeLoading ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-24 text-center text-gray-400 font-black">
              문제를 불러오는 중입니다...
            </div>
          ) : practiceError || !pq ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-24 flex flex-col items-center gap-6">
              <p className="text-gray-400 font-black">{practiceError || '등록된 문제가 없습니다.'}</p>
              <button
                onClick={() => fetchPracticeQuestion(selectedCert.id, practiceSeenIds)}
                className="flex items-center px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl font-black text-gray-500 transition-colors"
              >
                <RotateCcw size={16} className="mr-2" /> 다시 시도
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[12px] font-black text-[#3478B8] uppercase tracking-widest bg-[#3478B8]/10 px-4 py-2 rounded-full flex items-center">
                    <Zap size={14} className="mr-1.5" /> Question {String(practiceStats.solved + 1).padStart(2, '0')}
                  </span>
                  {isAnswered && (
                    <span className={`text-[12px] font-black px-4 py-2 rounded-full tracking-widest uppercase
                      ${(String(pq.answer) === String(pq.optionsArray[parseInt(practiceUserAnswer) - 1]) || String(pq.answer) === String(practiceUserAnswer)) ? 'bg-[#3BAA7D]/10 text-[#3BAA7D]' : 'bg-[#E61E2B]/10 text-[#E61E2B]'}`}>
                      {(String(pq.answer) === String(pq.optionsArray[parseInt(practiceUserAnswer) - 1]) || String(pq.answer) === String(practiceUserAnswer)) ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-black leading-snug text-[#4A4F58] break-keep">
                  {pq.question}
                </h3>
              </div>

              <div className="space-y-4">
                {pq.optionsArray.map((opt, optIdx) => (
                  <Option
                    key={optIdx}
                    text={`${optIdx + 1}. ${opt}`}
                    isSelected={practiceUserAnswer === String(optIdx + 1)}
                    isActualAnswer={String(pq.answer) === String(opt) || String(pq.answer) === String(optIdx + 1)}
                    isGraded={isAnswered}
                    onClick={() => handlePracticeSelect(String(optIdx + 1))}
                  />
                ))}
              </div>

              {isAnswered && pq.explanation && (
                <div className="mt-10 p-6 rounded-[24px] bg-[#3BAA7D]/5 border border-[#3BAA7D]/20 text-[#4A4F58] text-sm leading-relaxed">
                  <div className="flex items-center mb-3">
                    <span className="text-[#3BAA7D] font-black tracking-tight flex items-center">
                      <CheckCircle size={16} className="mr-1.5" /> 문제 해설
                    </span>
                  </div>
                  <p className="font-medium whitespace-pre-line text-gray-600">{pq.explanation}</p>
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNextPractice}
                  className="w-full mt-10 py-5 rounded-[24px] font-black text-lg bg-[#3478B8] text-white shadow-xl shadow-[#3478B8]/20 hover:bg-[#2e69a3] transition-all flex items-center justify-center"
                >
                  다음 문제 <ChevronRight size={20} className="ml-2" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]

  // ==========================================
  // [2단계 화면] CBT 문제 풀이
  // ==========================================
  return (
    <div className="min-h-screen bg-[#EAECEF] font-sans text-[#4A4F58] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* 좌측: 문제 영역 */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          <header className="flex items-center justify-between bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-4">
              <button onClick={() => { if (window.confirm('시험을 중단하시겠습니까? 기록이 저장되지 않습니다.')) setIsStarted(false) }}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-full transition-colors border border-gray-100"
              >
                <RotateCcw size={18} />
              </button>
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedCert.name} 모의고사</h2>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs font-black text-gray-400 tracking-tighter mb-1.5">진행률 {currentIndex + 1} / {questions.length}</div>
              <div className="w-32 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#3478B8] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </header>

          {q && (
            <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-sm flex-1 flex flex-col">
              <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[12px] font-black text-[#3478B8] uppercase tracking-widest bg-[#3478B8]/10 px-4 py-2 rounded-full flex items-center">
                    <Zap size={14} className="mr-1.5" /> Question {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  {isGraded && (
                    <span className={`text-[12px] font-black px-4 py-2 rounded-full tracking-widest uppercase
                      ${(String(q.answer) === String(q.optionsArray[parseInt(userAnswers[q.learnId]) - 1]) || String(q.answer) === String(userAnswers[q.learnId])) ? 'bg-[#3BAA7D]/10 text-[#3BAA7D]' : 'bg-[#E61E2B]/10 text-[#E61E2B]'}`}>
                      {(String(q.answer) === String(q.optionsArray[parseInt(userAnswers[q.learnId]) - 1]) || String(q.answer) === String(userAnswers[q.learnId])) ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-black leading-snug text-[#4A4F58] break-keep">
                  {q.question}
                </h3>
              </div>

              <div className="space-y-4 flex-1">
                {q.optionsArray.map((opt, optIdx) => (
                  <Option
                    key={optIdx}
                    text={`${optIdx + 1}. ${opt}`}
                    isSelected={userAnswers[q.learnId] === String(optIdx + 1)}
                    isActualAnswer={String(q.answer) === String(opt) || String(q.answer) === String(optIdx + 1)}
                    isGraded={isGraded}
                    onClick={() => handleSelectAnswer(q.learnId, String(optIdx + 1))}
                  />
                ))}
              </div>

              {isGraded && q.explanation && (
                <div className="mt-10 p-6 rounded-[24px] bg-[#3BAA7D]/5 border border-[#3BAA7D]/20 text-[#4A4F58] text-sm leading-relaxed">
                  <div className="flex items-center mb-3">
                    <span className="text-[#3BAA7D] font-black tracking-tight flex items-center">
                      <CheckCircle size={16} className="mr-1.5" /> 문제 해설
                    </span>
                  </div>
                  <p className="font-medium whitespace-pre-line text-gray-600">{q.explanation}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center space-x-4">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="flex items-center px-8 py-5 bg-white border border-gray-200 hover:bg-gray-50 text-[#4A4F58] rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed font-black"
            >
              <ChevronLeft className="mr-2" size={20} /> 이전 문항
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center flex-1 justify-center px-8 py-5 bg-[#3478B8]/10 hover:bg-[#3478B8]/20 border border-[#3478B8]/20 text-[#3478B8] rounded-2xl transition font-black disabled:opacity-30 disabled:cursor-not-allowed"
            >
              다음 문항 <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        </div>

        {/* 우측: OMR 및 정보 패널 */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
          <div className="bg-[#4A4F58] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden text-center border border-gray-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="text-gray-300 font-black text-xs mb-3 uppercase tracking-widest flex items-center justify-center">
              <Timer size={16} className="mr-2" /> Remaining Time
            </div>
            <div className={`text-5xl font-mono font-black tracking-tighter ${timeLeft < 600 ? 'text-[#E61E2B]' : 'text-[#D9A23A]'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm flex-1 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-lg flex items-center tracking-tight">
                <BookOpen size={18} className="mr-2 text-[#3478B8]" /> 답안 현황
              </h3>
              <span className="text-[11px] font-black bg-[#3478B8]/10 px-3 py-1.5 rounded-full text-[#3478B8] uppercase tracking-widest">
                {Object.keys(userAnswers).length} / {questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5 overflow-y-auto pr-2 flex-1 content-start custom-scrollbar">
              {questions.map((question, idx) => {
                const isAnswered = !!userAnswers[question.learnId]
                const isCurrent = currentIndex === idx
                let btnClass = 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300' // 기본 (안풂)

                if (isGraded) {
                  const uAnswer = userAnswers[question.learnId];
                  let isCorrect = false;
                  if (uAnswer) {
                    if (Array.isArray(question.answer)) {
                      isCorrect = JSON.stringify(question.answer) === JSON.stringify(uAnswer);
                    } else {
                      const uAnswerText = question.optionsArray[parseInt(uAnswer) - 1];
                      isCorrect = String(question.answer) === String(uAnswerText) || String(question.answer) === String(uAnswer);
                    }
                  }
                  if (isCorrect) btnClass = 'bg-[#3BAA7D]/10 border-[#3BAA7D]/30 text-[#3BAA7D]' // 정답
                  else if (isAnswered) btnClass = 'bg-[#E61E2B]/10 border-[#E61E2B]/30 text-[#E61E2B]' // 오답
                  else btnClass = 'bg-gray-100 border-transparent text-gray-300' // 미응답
                } else {
                  if (isCurrent) btnClass = 'bg-[#3478B8] text-white border-[#3478B8] shadow-md shadow-[#3478B8]/20' // 현재 위치
                  else if (isAnswered) btnClass = 'bg-[#3478B8]/10 border-[#3478B8]/20 text-[#3478B8]' // 푼 문제
                }

                return (
                  <button
                    key={question.learnId}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-12 rounded-xl text-sm font-black border transition-all flex items-center justify-center ${btnClass}`}
                  >
                    {isAnswered && !isGraded && !isCurrent ? <Check size={16} strokeWidth={3} /> : idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={submitExam}
            disabled={isGraded}
            className="w-full bg-[#3BAA7D] hover:bg-[#31926b] text-white py-6 rounded-[24px] transition-colors font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#3BAA7D]/20 shrink-0 tracking-tight"
          >
            {isGraded ? '채점 완료' + (isRetakeMode ? '' : ' (오답노트 저장됨)') : '답안 최종 제출하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 재사용 가능한 옵션 컴포넌트
// ==========================================
const Option = ({ text, isSelected, isActualAnswer, isGraded, onClick }) => {
  let btnClass = 'bg-white border-gray-200 hover:border-[#3478B8] text-[#4A4F58] hover:bg-gray-50' // 기본상태

  if (isGraded) {
    if (isActualAnswer) {
      btnClass = 'bg-[#3BAA7D]/10 border-[#3BAA7D] text-[#3BAA7D]'
    } else if (isSelected && !isActualAnswer) {
      btnClass = 'bg-[#E61E2B]/5 border-[#E61E2B]/50 text-[#E61E2B]'
    } else {
      btnClass = 'bg-gray-50 border-gray-100 text-gray-300 opacity-60'
    }
  } else if (isSelected) {
    btnClass = 'border-[#3478B8] bg-[#3478B8]/5 text-[#3478B8] shadow-inner shadow-[#3478B8]/5'
  }

  return (
    <button
      onClick={onClick}
      disabled={isGraded}
      className={`w-full p-5 text-left rounded-[20px] transition-all border-2 flex justify-between items-center group ${btnClass}`}
    >
      <span className="font-bold text-[15px]">{text}</span>
      {isGraded && isActualAnswer && <CheckCircle size={22} className="shrink-0 ml-4 text-[#3BAA7D]" />}
      {isGraded && isSelected && !isActualAnswer && <XCircle size={22} className="shrink-0 ml-4 text-[#E61E2B]" />}
      {!isGraded && isSelected && <CheckCircle size={22} className="shrink-0 ml-4 text-[#3478B8]" />}
    </button>
  )
}

export default StudyPage
