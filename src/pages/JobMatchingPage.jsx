import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobApi } from '../api/jobApi'
import CertManagerModal from '../components/common/CertManagerModal'
import {
  Briefcase, Search, MapPin, Building2, Clock, Award,
  ExternalLink, FileText, Sparkles, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, BookOpen, Target, Settings
} from 'lucide-react'

const CERT_KEYWORDS = [
  '정보처리기사',
  'SQLD',
  'ADsP',
  '리눅스마스터',
  '네트워크관리사',
  '빅데이터분석기사',
  '정보보안기사',
  '컴퓨터활용능력'
]

const CERT_ALIASES = {
  '정처기': '정보처리기사',
  '정처산기': '정보처리산업기사',
  '컴활': '컴퓨터활용능력',
  '컴활1급': '컴퓨터활용능력',
  '컴활2급': '컴퓨터활용능력',
  '리마': '리눅스마스터',
  '네관': '네트워크관리사',
  '빅분기': '빅데이터분석기사',
  '보안기사': '정보보안기사',
  '전기': '전기기사',
  'sqld': 'SQLD',
  'adsp': 'ADsP',
  'aws': 'AWS SAA',
}

const ROLE_FILTERS = [
  '전체',
  '백엔드',
  '프론트엔드',
  '데이터',
  '인프라·보안',
  '신입',
  '공기업'
]

const JobMatchingPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [jobData, setJobData] = useState({
    userName: null,
    userMajor: null,
    userInterest: null,
    myCertifications: [],
    acquiredCertifications: [],
    targetCertifications: [],
    activeKeyword: '정보처리기사',
    postings: []
  })
  const [selectedCert, setSelectedCert] = useState('AUTO')
  const [selectedRole, setSelectedRole] = useState('전체')
  const [customSearch, setCustomSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isCertModalOpen, setIsCertModalOpen] = useState(false)

  const openCertManager = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('로그인이 필요한 기능입니다. 로그인 후 내 보유·목표 자격증을 관리해보세요!')
      navigate('/login')
      return
    }
    setIsCertModalOpen(true)
  }

  const fetchJobs = (keywordParam, roleParam, pageParam) => {
    setLoading(true)
    const roleQuery = roleParam === '인프라·보안' ? '보안' : roleParam
    jobApi.getRecommendations({
      keyword: keywordParam,
      role: roleQuery,
      page: pageParam
    })
      .then(res => {
        if (res.data) {
          setJobData(res.data)
          if (keywordParam === 'AUTO' && res.data.activeKeyword) {
            setSelectedCert(res.data.activeKeyword)
          }
        }
      })
      .catch(err => {
        console.error('채용공고 조회 실패:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchJobs(selectedCert, selectedRole, page)
  }, [selectedCert, selectedRole, page])

  const handleCertSelect = (cert) => {
    setCustomSearch('')
    setPage(1)
    setSelectedCert(cert)
  }

  const handleRoleSelect = (role) => {
    setPage(1)
    setSelectedRole(role)
  }

  const resolveCertKeyword = (rawInput) => {
    const trimmed = rawInput.trim()
    if (!trimmed) return null
    const lower = trimmed.toLowerCase()

    // 1. 별칭 매핑 확인
    if (CERT_ALIASES[lower]) {
      return CERT_ALIASES[lower]
    }

    // 2. 전체 유효 자격증 목록
    const validCerts = Array.from(new Set([
      ...(jobData.myCertifications || []),
      ...CERT_KEYWORDS,
      '전기기사',
      '정보처리산업기사',
      '네트워크관리사 2급',
      '리눅스마스터 1급',
      '컴퓨터활용능력 1급',
      '정보보안산업기사',
      'AWS SAA'
    ]))

    // 3. 완전 일치 (대소문자 무시)
    const exact = validCerts.find(c => c.toLowerCase() === lower)
    if (exact) return exact

    // 4. 부분 일치 (예: '정보처리' -> '정보처리기사', 'sql' -> 'SQLD')
    const partial = validCerts.find(c => 
      c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())
    )
    if (partial) return partial

    return null
  }

  const handleCustomSearch = (e) => {
    e.preventDefault()
    if (!customSearch.trim()) return

    const matched = resolveCertKeyword(customSearch)
    if (!matched) {
      alert(`'${customSearch.trim()}'(은)는 등록된 자격증 종목이 아닙니다.\n올바른 자격증 명칭(예: 정보처리기사, SQLD, ADsP, 리눅스마스터 등)을 입력해주세요.`)
      return
    }

    setPage(1)
    setSelectedCert(matched)
    setCustomSearch('')
  }

  const handleGoCoverLetter = (job) => {
    const roleText = (job.sectors && job.sectors.length > 0)
      ? job.sectors.slice(0, 2).join(' · ')
      : job.title
    navigate('/cover-letter', {
      state: {
        companyName: job.companyName,
        jobRole: roleText,
        certName: job.matchedCert || jobData.activeKeyword,
        jobTitle: job.title
      }
    })
  }

  // 내 보유/준비 자격증과 기본 인기 자격증을 합쳐 중복 제거
  const allCertTabs = Array.from(
    new Set([...(jobData.myCertifications || []), ...CERT_KEYWORDS])
  )

  return (
    <div className="min-h-screen bg-[#EAECEF] text-[#4A4F58] font-sans pb-16">
      {/* 상단 히어로 배너 */}
      <header className="bg-white border-b border-gray-200 py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-[#3478B8]/10 px-4 py-1.5 rounded-full mb-4">
                <Briefcase size={14} className="text-[#3478B8]" />
                <span className="text-xs font-black text-[#3478B8]">사람인(Saramin) 실시간 자격증 우대 채용 연동</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#4A4F58] leading-tight">
                {jobData.userName ? `${jobData.userName}님을 위한 ` : ''}
                <span className="text-[#3478B8]">자격증 맞춤 취업 연계</span>
              </h1>
              <p className="text-gray-500 font-bold text-sm mt-2">
                내가 보유하거나 준비 중인 자격증을 우대하는 실시간 채용공고를 확인하고, 원클릭으로 맞춤 자기소개서까지 작성하세요.
              </p>
            </div>

            {/* 내 보유/준비 중 자격증 현황 카드 */}
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-3xl p-5 min-w-[320px] max-w-md shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <span className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                  <Award size={14} className="text-[#3478B8]" />
                  내 보유 · 목표 자격증
                </span>
                <button
                  onClick={openCertManager}
                  className="text-xs font-bold text-[#3478B8] hover:underline"
                >
                  관리하기 &gt;
                </button>
              </div>
              {jobData.myCertifications && jobData.myCertifications.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {jobData.myCertifications.map(cert => {
                    const isAcquired = jobData.acquiredCertifications?.includes(cert)
                    const isActive = jobData.activeKeyword === cert
                    return (
                      <button
                        key={cert}
                        onClick={() => handleCertSelect(cert)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition border ${
                          isActive
                            ? isAcquired
                              ? 'bg-[#3BAA7D] text-white border-[#3BAA7D] shadow-sm'
                              : 'bg-[#3478B8] text-white border-[#3478B8] shadow-sm'
                            : isAcquired
                              ? 'bg-[#3BAA7D]/10 text-[#3BAA7D] border-[#3BAA7D]/20 hover:bg-[#3BAA7D]/20'
                              : 'bg-[#3478B8]/10 text-[#3478B8] border-[#3478B8]/20 hover:bg-[#3478B8]/20'
                        }`}
                      >
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isAcquired
                              ? 'bg-[#3BAA7D] text-white'
                              : 'bg-[#3478B8] text-white'
                        }`}>
                          {isAcquired ? '보유' : '목표'}
                        </span>
                        {cert}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 font-bold">
                    등록된 보유·목표 자격증이 없습니다.
                  </p>
                  <button
                    onClick={openCertManager}
                    className="text-xs font-black text-[#3478B8] hover:underline shrink-0"
                  >
                    + 지금 등록하기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 자격증 선택 탭 & 검색창 */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {allCertTabs.map(cert => {
                const isMine = jobData.myCertifications?.includes(cert)
                const isActive = jobData.activeKeyword === cert
                return (
                  <button
                    key={cert}
                    onClick={() => handleCertSelect(cert)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-[#3478B8] text-white border-[#3478B8] shadow-md'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Award size={14} className={isActive ? 'text-white' : isMine ? 'text-[#3BAA7D]' : 'text-gray-400'} />
                    {cert}
                    {isMine && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#3BAA7D]/15 text-[#3BAA7D]'
                      }`}>
                        내 자격증
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 직접 키워드 검색 */}
            <form onSubmit={handleCustomSearch} className="relative min-w-[280px]">
              <input
                type="text"
                list="cert-search-suggestions"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="자격증 종목 검색 (예: 정보처리기사, SQLD)..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-bold outline-none focus:border-[#3478B8] transition"
              />
              <datalist id="cert-search-suggestions">
                {allCertTabs.map(cert => (
                  <option key={cert} value={cert} />
                ))}
              </datalist>
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3478B8] hover:text-[#2e69a3]"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* 직무 상세 필터 */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-black text-gray-400 mr-2">직무 · 유형 필터:</span>
            {ROLE_FILTERS.map(role => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                  selectedRole === role
                    ? 'bg-[#4A4F58] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 본문: 실시간 채용공고 그리드 */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#4A4F58]">
              <span className="text-[#3478B8]">'{jobData.activeKeyword}'</span> 우대 실시간 채용공고
            </h2>
            {selectedRole !== '전체' && (
              <span className="text-xs font-black bg-[#3478B8]/10 text-[#3478B8] px-3 py-1 rounded-full">
                #{selectedRole}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/study')}
            className="text-xs font-black text-gray-500 hover:text-[#3478B8] flex items-center gap-1 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition"
          >
            <BookOpen size={14} className="text-[#3478B8]" />
            {jobData.activeKeyword} 기출 모의고사 풀러가기 &gt;
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#3478B8] animate-spin mb-4" />
            <p className="text-base font-black text-[#4A4F58]">
              사람인에서 '{selectedCert === 'AUTO' ? '맞춤 자격증' : selectedCert}' 우대 채용공고를 실시간으로 불러오는 중입니다...
            </p>
          </div>
        ) : jobData.postings && jobData.postings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobData.postings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#3478B8]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* 상단: 기업명 & 매칭 배지 */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#3478B8]/10 text-[#3478B8] flex items-center justify-center font-black text-sm shrink-0">
                          {job.companyName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-[#4A4F58] truncate" title={job.companyName}>
                            {job.companyName}
                          </h4>
                          {job.badge && (
                            <span className="inline-block text-[10px] font-bold text-[#D9A23A] bg-[#D9A23A]/10 px-2 py-0.5 rounded-md mt-0.5">
                              {job.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`shrink-0 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        (job.myCert || job.isMyCert)
                          ? 'bg-[#3BAA7D]/15 text-[#3BAA7D]'
                          : 'bg-[#3478B8]/10 text-[#3478B8]'
                      }`}>
                        <Sparkles size={11} />
                        매칭 {job.matchScore}%
                      </span>
                    </div>

                    {/* 공고 제목 */}
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-base font-black text-[#222222] group-hover:text-[#3478B8] transition line-clamp-2 leading-snug mb-4"
                      title={job.title}
                    >
                      {job.title}
                    </a>

                    {/* 우대 자격증 표시 */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center text-[11px] font-black px-3 py-1 rounded-xl ${
                        (job.myCert || job.isMyCert)
                          ? 'bg-[#3BAA7D]/10 text-[#3BAA7D] border border-[#3BAA7D]/20'
                          : 'bg-blue-50 text-[#3478B8] border border-blue-100'
                      }`}>
                        <Award size={12} className="mr-1.5" />
                        {job.matchedCert} {(job.myCert || job.isMyCert) ? '(내 자격증 매칭 완료)' : '우대 채용'}
                      </span>
                    </div>

                    {/* 근무 조건 태그 */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-gray-500 mb-4">
                      {job.location && (
                        <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg flex items-center">
                          <MapPin size={11} className="mr-1 text-gray-400" />
                          {job.location}
                        </span>
                      )}
                      {job.experience && (
                        <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          {job.experience}
                        </span>
                      )}
                      {job.education && (
                        <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          {job.education}
                        </span>
                      )}
                      {job.employmentType && (
                        <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                          {job.employmentType}
                        </span>
                      )}
                    </div>

                    {/* 직무 분야 */}
                    {job.sectors && job.sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.sectors.slice(0, 4).map((sec, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-gray-400 bg-gray-100/80 px-2 py-0.5 rounded-md">
                            #{sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 하단: 마감일 & 액션 버튼 2개 */}
                  <div className="pt-4 border-t border-gray-100 mt-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-3">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1 text-[#D9A23A]" />
                        마감: <strong className="text-[#4A4F58] ml-1">{job.deadline || '채용시 마감'}</strong>
                      </span>
                      {job.salary && <span className="text-[#3BAA7D] font-black">{job.salary}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGoCoverLetter(job)}
                        className="py-2.5 px-3 rounded-xl bg-[#3478B8] text-white text-xs font-black flex items-center justify-center gap-1.5 hover:bg-[#2e69a3] transition shadow-sm"
                      >
                        <FileText size={13} />
                        맞춤 자소서 작성
                      </button>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-gray-100 text-[#4A4F58] text-xs font-black flex items-center justify-center gap-1.5 hover:bg-gray-200 transition"
                      >
                        사람인 원문 공고
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-[#4A4F58] hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1 shadow-sm transition"
              >
                <ChevronLeft size={15} /> 이전 페이지
              </button>
              <span className="text-sm font-black text-[#3478B8] bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                {page} 페이지
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-[#4A4F58] hover:bg-gray-50 flex items-center gap-1 shadow-sm transition"
              >
                다음 페이지 <ChevronRight size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm">
            <p className="text-base font-black text-gray-500 mb-2">
              조건에 맞는 채용공고를 찾지 못했습니다.
            </p>
            <p className="text-xs text-gray-400 font-bold">
              다른 자격증 탭을 클릭하거나 직무 필터를 '전체'로 변경해 보세요.
            </p>
          </div>
        )}
      </main>

      {/* 내 보유 · 목표 자격증 통합 관리 모달 */}
      <CertManagerModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onUpdated={() => fetchJobs(selectedCert, selectedRole, page)}
      />
    </div>
  )
}

export default JobMatchingPage
