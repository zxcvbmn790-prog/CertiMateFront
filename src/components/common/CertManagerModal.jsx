import React, { useState, useEffect } from 'react'
import {
  Award, Calendar, CheckCircle2, Plus, Trash2, X,
  Sparkles, Target, ArrowRight, Loader2
} from 'lucide-react'
import { userApi } from '../../api/userApi'

const POPULAR_CERT_NAMES = [
  '정보처리기사',
  'SQLD',
  'ADsP',
  '리눅스마스터 1급',
  '네트워크관리사 2급',
  '정보보안기사',
  '컴퓨터활용능력 1급',
  '전기기사',
  '빅데이터분석기사'
]

const CertManagerModal = ({ isOpen, onClose, onUpdated }) => {
  const todayStr = new Date().toISOString().split('T')[0]

  const [loading, setLoading] = useState(false)
  const [acquiredList, setAcquiredList] = useState([])
  const [targetList, setTargetList] = useState([])
  const [allCerts, setAllCerts] = useState([])

  // 보유 자격증 추가 폼
  const [acquiredInputMode, setAcquiredInputMode] = useState('select') // 'select' | 'custom'
  const [acquiredCertName, setAcquiredCertName] = useState('')
  const [acquiredDate, setAcquiredDate] = useState(todayStr)
  const [submittingAcquired, setSubmittingAcquired] = useState(false)

  // 목표 자격증(시험 일정) 추가 폼
  const [targetInputMode, setTargetInputMode] = useState('select') // 'select' | 'custom'
  const [targetCertName, setTargetCertName] = useState('')
  const [examType, setExamType] = useState('필기')
  const [examDate, setExamDate] = useState('')
  const [targetReadCount, setTargetReadCount] = useState(25)
  const [submittingTarget, setSubmittingTarget] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await userApi.getDashboard()
      const data = res.data || {}
      setAcquiredList(data.acquiredCertifications || [])
      setTargetList(data.targetExams || [])
      setAllCerts(data.allCertifications || [])
    } catch (err) {
      console.error('자격증 현황 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  if (!isOpen) return null

  // 드롭다운 선택지 통합 (DB 자격증 + 인기 자격증 중복 제거)
  const certOptions = Array.from(
    new Set([
      ...allCerts.map(c => c.name),
      ...POPULAR_CERT_NAMES
    ])
  )

  const findCertIdByName = (name) => {
    const found = allCerts.find(c => c.name === name)
    return found ? found.id : null
  }

  const handleAddAcquired = async (e) => {
    e.preventDefault()
    if (!acquiredCertName.trim()) {
      alert('보유 자격증명을 선택하거나 입력해주세요.')
      return
    }
    setSubmittingAcquired(true)
    try {
      const certId = findCertIdByName(acquiredCertName.trim())
      await userApi.addAcquiredCertification({
        certId,
        certName: acquiredCertName.trim(),
        acquiredDate: acquiredDate || todayStr
      })
      setAcquiredCertName('')
      setAcquiredDate(todayStr)
      await loadData()
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      alert('보유 자격증 등록에 실패했습니다. 로그인 상태를 확인해주세요.')
    } finally {
      setSubmittingAcquired(false)
    }
  }

  const handleDeleteAcquired = async (id, name) => {
    if (!window.confirm(`'${name}' 보유 자격증을 삭제하시겠습니까?`)) return
    try {
      await userApi.deleteAcquiredCertification(id)
      await loadData()
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleAddTarget = async (e) => {
    e.preventDefault()
    if (!targetCertName.trim() || !examDate) {
      alert('목표 자격증명과 시험 날짜를 모두 입력해주세요.')
      return
    }
    setSubmittingTarget(true)
    try {
      const certId = findCertIdByName(targetCertName.trim())
      await userApi.addSchedule({
        certId,
        certName: targetCertName.trim(),
        examType,
        examDate,
        targetReadCount: Number(targetReadCount) || 25
      })
      setTargetCertName('')
      setExamDate('')
      setTargetReadCount(25)
      await loadData()
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      alert('목표 시험 일정 등록에 실패했습니다. 로그인 상태를 확인해주세요.')
    } finally {
      setSubmittingTarget(false)
    }
  }

  const handleDeleteTarget = async (id, name) => {
    if (!window.confirm(`'${name}' 목표 시험 일정을 삭제하시겠습니까?`)) return
    try {
      await userApi.deleteSchedule(id)
      await loadData()
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      alert('삭제에 실패했습니다.')
    }
  }

  const handlePromoteToAcquired = async (exam) => {
    if (!window.confirm(`축하합니다! 🎉 '${exam.certName}' 시험을 합격(취득 완료) 처리하여 보유 자격증으로 전환하시겠습니까?`)) return
    try {
      await userApi.addAcquiredCertification({
        certId: exam.certId || findCertIdByName(exam.certName),
        certName: exam.certName,
        acquiredDate: todayStr,
        fromScheduleId: exam.id
      })
      await loadData()
      if (onUpdated) onUpdated()
    } catch (err) {
      console.error(err)
      alert('합격 전환 처리에 실패했습니다.')
    }
  }

  return (
    <div className="no-print fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8FAFC] rounded-[32px] w-full max-w-5xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* 상단 헤더 */}
        <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3478B8]/10 text-[#3478B8] flex items-center justify-center">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#4A4F58]">
                내 보유 · 목표 자격증 통합 관리
              </h2>
              <p className="text-xs font-bold text-gray-400 mt-0.5">
                취득 완료한 자격증과 현재 준비 중인 목표 시험을 한곳에서 관리하고 맞춤 채용공고와 연동하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문: 좌(보유 자격증) / 우(목표 자격증) 2단 레이아웃 */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400 font-bold">
              <Loader2 className="w-8 h-8 animate-spin text-[#3478B8] mb-3" />
              자격증 정보를 불러오는 중입니다...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 보유 자격증 (취득 완료) */}
              <div className="bg-white rounded-[28px] p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#3BAA7D]/15 text-[#3BAA7D] flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[#4A4F58]">
                        보유 자격증 <span className="text-[#3BAA7D]">({acquiredList.length})</span>
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400">이미 취득한 자격증</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAcquiredInputMode(acquiredInputMode === 'select' ? 'custom' : 'select')
                      setAcquiredCertName('')
                    }}
                    className="text-[11px] font-bold text-[#3478B8] hover:underline"
                  >
                    {acquiredInputMode === 'select' ? '직접 입력하기' : '목록에서 선택'}
                  </button>
                </div>

                {/* 보유 자격증 빠른 추가 폼 */}
                <form onSubmit={handleAddAcquired} className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 mb-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1">자격증 종목</label>
                      {acquiredInputMode === 'select' ? (
                        <select
                          value={acquiredCertName}
                          onChange={e => setAcquiredCertName(e.target.value)}
                          className="w-full border border-gray-200 focus:border-[#3BAA7D] rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-white"
                          required
                        >
                          <option value="">자격증 선택</option>
                          {certOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={acquiredCertName}
                          onChange={e => setAcquiredCertName(e.target.value)}
                          placeholder="예: AWS SAA, 리눅스마스터"
                          className="w-full border border-gray-200 focus:border-[#3BAA7D] rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-white"
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1">취득 일자</label>
                      <input
                        type="date"
                        value={acquiredDate}
                        onChange={e => setAcquiredDate(e.target.value)}
                        className="w-full border border-gray-200 focus:border-[#3BAA7D] rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-white"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submittingAcquired}
                    className="w-full py-2.5 bg-[#3BAA7D] hover:bg-[#32966d] text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Plus size={14} />
                    보유 자격증 등록
                  </button>
                </form>

                {/* 보유 자격증 리스트 */}
                <div className="flex-1 space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {acquiredList.length > 0 ? (
                    acquiredList.map(item => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#3BAA7D]/5 border border-[#3BAA7D]/20 flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#3BAA7D] text-white flex items-center justify-center shrink-0">
                            <Award size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black bg-[#3BAA7D] text-white px-2 py-0.5 rounded-full">
                                보유
                              </span>
                              <h4 className="text-sm font-black text-[#4A4F58] truncate" title={item.certName}>
                                {item.certName}
                              </h4>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                              취득일: {item.acquiredDate}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteAcquired(item.id, item.certName)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition shrink-0"
                          title="보유 자격증 삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs font-bold">
                      아직 등록된 보유 자격증이 없습니다.<br />
                      위에서 취득한 자격증을 등록하거나 우측 목표 시험을 합격 전환해보세요!
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 목표 자격증 (준비 중인 시험) */}
              <div className="bg-white rounded-[28px] p-6 border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#3478B8]/15 text-[#3478B8] flex items-center justify-center">
                      <Target size={18} />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-[#4A4F58]">
                        목표 자격증 · 시험 일정 <span className="text-[#3478B8]">({targetList.length})</span>
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400">현재 준비 중인 목표 자격증</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetInputMode(targetInputMode === 'select' ? 'custom' : 'select')
                      setTargetCertName('')
                    }}
                    className="text-[11px] font-bold text-[#3478B8] hover:underline"
                  >
                    {targetInputMode === 'select' ? '직접 입력하기' : '목록에서 선택'}
                  </button>
                </div>

                {/* 목표 자격증 빠른 추가 폼 */}
                <form onSubmit={handleAddTarget} className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 mb-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1">목표 자격증 종목</label>
                      {targetInputMode === 'select' ? (
                        <select
                          value={targetCertName}
                          onChange={e => setTargetCertName(e.target.value)}
                          className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-white"
                          required
                        >
                          <option value="">자격증 선택</option>
                          {certOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={targetCertName}
                          onChange={e => setTargetCertName(e.target.value)}
                          placeholder="예: 정보처리기사, SQLD"
                          className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-3 py-2.5 text-xs font-bold outline-none bg-white"
                          required
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-black text-gray-500 mb-1">구분</label>
                        <select
                          value={examType}
                          onChange={e => setExamType(e.target.value)}
                          className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-2.5 py-2.5 text-xs font-bold outline-none bg-white"
                        >
                          <option value="필기">필기</option>
                          <option value="실기">실기</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-500 mb-1">목표 회독</label>
                        <input
                          type="number"
                          min="1"
                          value={targetReadCount}
                          onChange={e => setTargetReadCount(e.target.value)}
                          className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-2.5 py-2.5 text-xs font-bold outline-none bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                    <div>
                      <label className="block text-[11px] font-black text-gray-500 mb-1">시험 일자</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                        className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-3 py-2 text-xs font-bold outline-none bg-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingTarget}
                      className="w-full py-2.5 bg-[#3478B8] hover:bg-[#2b669e] text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Plus size={14} />
                      목표 시험 등록
                    </button>
                  </div>
                </form>

                {/* 목표 시험 리스트 */}
                <div className="flex-1 space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {targetList.length > 0 ? (
                    targetList.map(exam => (
                      <div
                        key={exam.id}
                        className="p-4 rounded-2xl bg-[#3478B8]/5 border border-[#3478B8]/20 flex flex-col gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black bg-[#3478B8] text-white px-2 py-0.5 rounded-full">
                                목표 · {exam.examType}
                              </span>
                              <h4 className="text-sm font-black text-[#4A4F58] truncate" title={exam.certName}>
                                {exam.certName}
                              </h4>
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 mt-1">
                              시험일: {exam.examDate} • 달성률 {exam.achievementRate}%
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-black text-[#D9A23A] bg-[#D9A23A]/15 px-2.5 py-1 rounded-lg">
                              {exam.dDay <= 0 ? 'D-Day' : `D-${exam.dDay}`}
                            </span>
                            <button
                              onClick={() => handlePromoteToAcquired(exam)}
                              className="px-2.5 py-1 bg-[#3BAA7D] hover:bg-[#32966d] text-white rounded-lg text-[11px] font-black transition flex items-center gap-1 shadow-sm"
                              title="합격 처리하여 보유 자격증으로 이동"
                            >
                              <CheckCircle2 size={12} />
                              합격 전환
                            </button>
                            <button
                              onClick={() => handleDeleteTarget(exam.id, exam.certName)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="목표 일정 삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-[#3BAA7D] h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(100, Number(exam.achievementRate || 0))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs font-bold">
                      현재 준비 중인 목표 시험 일정이 없습니다.<br />
                      위에서 목표 자격증과 시험 날짜를 등록해보세요!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 푸터 */}
        <div className="bg-white px-8 py-4 border-t border-gray-200 flex justify-between items-center shrink-0">
          <p className="text-xs font-bold text-gray-400">
            💡 목표 시험에 합격하셨다면 <span className="text-[#3BAA7D] font-black">[합격 전환]</span> 버튼으로 원클릭 보유 자격증 등록이 가능합니다.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#4A4F58] hover:bg-[#363a41] text-white rounded-xl text-xs font-black transition"
          >
            완료 및 닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertManagerModal
