import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { userApi } from '../api/userApi'
import { communityApi } from '../api/communityApi'
import {
  User, Award, BookOpen, Bookmark,
  Settings, Bell, ChevronRight, PieChart,
  Calendar, CheckCircle2, Clock, X, Download, Activity,
  ChevronLeft, CheckCircle, XCircle, RotateCcw, Zap, ChevronDown
} from 'lucide-react'

const ProfilePage = () => {
  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState({
    name: '로딩 중...',
    university: '서일대학교',
    major: '로딩 중...',
    personality: '로딩 중...',
    status: '로딩 중...',
    profileImage: null,
    agreeConsent: true
  })

  const [dashboard, setDashboard] = useState({
    certCount: 0,
    scrapCount: 0,
    recentScraps: [],
    totalStudyTime: '0h',
    cbtAccuracy: '0%',
    heatmapData: [],
    targetExam: null
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const [myPosts, setMyPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('my-posts')

  const [editForm, setEditForm] = useState({ name: '', major: '', interest: '', status: '', password: '', profileImage: '', agreeConsent: true })

  const [modalState, setModalState] = useState({
    isOpen: false,
    date: null,
    view: 'sessions', // 'sessions' | 'notes'
    sessions: [],
    selectedSessionIdx: null,
    loading: false,
    currentIndex: 0
  })

  const fetchData = () => {
    authApi.getMe().then(res => {
      const data = res.data
      const consent = data.agreeConsent !== undefined ? data.agreeConsent : true
      setUserInfo({
        name: data.name || '이름 없음',
        university: '서일대학교',
        major: data.major || '미설정',
        personality: data.interest || '미설정',
        status: data.status || '미설정',
        profileImage: data.profileImage || null,
        agreeConsent: consent
      })
      setEditForm({
        name: data.name || '', major: data.major || '', interest: data.interest || '', status: data.status || '', password: '', profileImage: data.profileImage || '', agreeConsent: consent
      })
    }).catch(err => console.error(err))

    userApi.getDashboard().then(res => {
      setDashboard(res.data)
    }).catch(err => console.error(err))

    communityApi.getMyPosts().then(res => {
      setMyPosts(res.data)
    }).catch(err => console.error(err))

    communityApi.getLikedPosts().then(res => {
      setLikedPosts(res.data)
    }).catch(err => console.error(err))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEditSubmit = () => {
    authApi.updateMe(editForm)
      .then(() => {
        setEditForm(prev => ({ ...prev, password: '' }))
        fetchData()
      })
      .catch(err => alert('수정에 실패했습니다.'))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64Image = reader.result
      authApi.updateMe({ ...editForm, profileImage: base64Image })
        .then(() => {
          fetchData()
        })
        .catch(err => {
          console.error(err)
          alert('프로필 사진 변경 실패')
        })
    }
  }

  const handleConsentToggle = () => {
    const newConsent = !userInfo.agreeConsent
    const updatedForm = { ...editForm, agreeConsent: newConsent }
    authApi.updateMe(updatedForm)
      .then(() => {
        fetchData()
        alert(newConsent ? '개인정보 수집 및 이용에 동의하셨습니다.' : '개인정보 수집 및 이용 동의를 철회하셨습니다.')
      })
      .catch(err => alert('상태 변경에 실패했습니다.'))
  }

  const handleWithdraw = () => {
    authApi.withdraw()
      .then(() => {
        alert('회원탈퇴가 완료되었습니다.')
        localStorage.removeItem('isLoggedIn')
        navigate('/login')
      })
      .catch(err => alert('회원탈퇴에 실패했습니다.'))
  }

  const handleHeatmapClick = (date, count) => {
    if (count === 0) return
    setModalState({ isOpen: true, date: date, view: 'sessions', sessions: [], selectedSessionIdx: null, loading: true, currentIndex: 0 })

    userApi.getQuizHistory(date)
      .then(res => {
        setModalState(prev => ({ ...prev, sessions: res.data, loading: false }))
      })
      .catch(err => {
        console.error('오답노트 로드 실패:', err)
        setModalState(prev => ({ ...prev, loading: false }))
      })
  }

  const openNotes = (idx) => {
    const session = modalState.sessions[idx]
    navigate('/study', { state: { viewNotesSession: session } })
  }

  const openRetake = (idx) => {
    const session = modalState.sessions[idx]
    const incorrectRecords = session.records.filter(r => !r.isCorrect)

    if (incorrectRecords.length === 0) {
      alert('이 회차에는 틀린 문제가 없습니다! 완벽합니다! 🎉')
      return
    }

    navigate('/study', { state: { retakeSession: { ...session, records: incorrectRecords } } })
  }

  const renderHeatmap = () => {
    const boxes = []
    const today = new Date()
    for (let i = 119; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const offset = d.getTimezoneOffset() * 60000
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().split('T')[0]

      const countObj = dashboard.heatmapData?.find(h => h.date === localISOTime)
      const count = countObj ? countObj.count : 0

      let bg = 'bg-gray-200/60'
      if (count > 0 && count <= 2) bg = 'bg-[#3BAA7D]/30'
      else if (count > 2 && count <= 5) bg = 'bg-[#3BAA7D]/60'
      else if (count > 5) bg = 'bg-[#3BAA7D]'

      boxes.push(
        <div
          key={localISOTime}
          onClick={() => handleHeatmapClick(localISOTime, count)}
          className={`w-3.5 h-3.5 rounded-sm ${bg} transition-all ${count > 0 ? 'cursor-pointer hover:ring-2 hover:ring-[#4A4F58]' : ''}`}
          title={`${localISOTime}: ${count} 문제 풀이${count > 0 ? ' (클릭하여 보기)' : ''}`}
        />
      )
    }
    return <div className="flex flex-wrap gap-1.5 mt-4">{boxes}</div>
  }

  const renderModalContent = () => {
    if (modalState.loading) return <div className="p-10 text-center text-gray-400 font-bold">데이터를 불러오는 중입니다...</div>
    if (modalState.sessions.length === 0) return <div className="p-10 text-center text-gray-400 font-bold">기록이 없습니다.</div>

    return (
      <div className="p-6 space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">해당 날짜의 학습 회차</h3>
        {modalState.sessions.map((session, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h4 className="text-lg font-black text-[#4A4F58]">{session.sessionNum}회차 학습</h4>
              <p className="text-sm text-gray-500 font-bold mt-1">{session.timeLabel} • 총 {session.records.length}문제</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => openNotes(idx)} className="px-5 py-3 bg-[#3BAA7D]/10 text-[#3BAA7D] font-black rounded-xl hover:bg-[#3BAA7D]/20 transition text-sm">
                오답 노트
              </button>
              <button onClick={() => openRetake(idx)} className="px-5 py-3 bg-[#E61E2B]/10 text-[#E61E2B] font-black rounded-xl hover:bg-[#E61E2B]/20 transition text-sm">
                틀린 문제 다시 풀기
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EAECEF] pb-20 font-sans print-area">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
          .no-print { display: none !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 20px; }
      `}</style>

      {/* 헤더 및 스탯 */}
      <header className="bg-white border-b border-gray-200 pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            {userInfo.profileImage ? (
              <img src={userInfo.profileImage} alt="Profile" className="w-32 h-32 rounded-[40px] object-cover shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-[#3478B8] to-[#3BAA7D] flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                {userInfo.name ? userInfo.name[0] : ''}
              </div>
            )}
            <label className="no-print absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-gray-400 hover:text-[#3478B8] cursor-pointer">
              <Settings size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-[#4A4F58] mb-2">{userInfo.name}</h2>
            <p className="text-[#3BAA7D] font-bold text-sm mb-4">{userInfo.university} | {userInfo.major}</p>
          </div>
          <div className="flex space-x-4 no-print relative">
            <button onClick={() => window.print()} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-400 hover:text-[#3BAA7D]"><Download size={20} /></button>
            <button className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-400"><Bell size={20} /></button>

            {/* 개인정보관리 토글 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-6 py-4 bg-[#3478B8] text-white rounded-2xl font-black text-sm shadow-xl flex items-center hover:bg-[#2e69a3] transition"
              >
                개인정보관리 <ChevronDown size={16} className="ml-2" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden text-sm font-bold animate-in fade-in slide-in-from-top-2">
                  <button onClick={() => { setIsEditModalOpen(true); setIsDropdownOpen(false) }} className="w-full text-left px-5 py-4 hover:bg-gray-50 text-gray-700 border-b border-gray-100 transition">정보 수정</button>
                  <div className="w-full px-5 py-4 flex justify-between items-center text-gray-700 border-b border-gray-100">
                    <span>이용동의 설정</span>
                    <div
                      onClick={handleConsentToggle}
                      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${userInfo.agreeConsent ? 'bg-[#3BAA7D]' : 'bg-gray-300'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${userInfo.agreeConsent ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                  <button onClick={() => { setIsWithdrawModalOpen(true); setIsDropdownOpen(false) }} className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 transition">회원탈퇴</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-12 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={<Award className="text-[#3478B8]" />} label="보유 자격증" value={dashboard.certCount} />
          <StatCard icon={<Bookmark className="text-[#D9A23A]" />} label="스크랩 종목" value={dashboard.scrapCount} />
          <StatCard icon={<PieChart className="text-[#3BAA7D]" />} label="CBT 정답률" value={dashboard.cbtAccuracy} />
          <StatCard icon={<Clock className="text-gray-400" />} label="학습 시간" value={dashboard.totalStudyTime} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 좌측 메인 영역 (70%) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black mb-2 flex items-center text-[#4A4F58]"><Activity className="mr-3 text-[#3BAA7D]" size={20} /> 꾸준한 학습의 흔적</h3>
              <p className="text-xs text-gray-400 font-bold mb-4">잔디를 클릭하면 회차별 오답노트나 다시 풀기를 할 수 있습니다.</p>
              {renderHeatmap()}
            </section>

            {/* 커뮤니티 활동 (내가 쓴 글 & 좋아요 누른 글) */}
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black mb-6 flex items-center text-[#4A4F58]">
                <BookOpen className="mr-3 text-[#3478B8]" size={20} /> 커뮤니티 활동
              </h3>
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('my-posts')}
                  className={`px-6 py-3 font-bold text-sm transition ${activeTab === 'my-posts' ? 'border-b-2 border-[#3478B8] text-[#3478B8]' : 'text-gray-400 hover:text-gray-600'}`}
                >내가 쓴 글</button>
                <button
                  onClick={() => setActiveTab('liked-posts')}
                  className={`px-6 py-3 font-bold text-sm transition ${activeTab === 'liked-posts' ? 'border-b-2 border-[#3478B8] text-[#3478B8]' : 'text-gray-400 hover:text-gray-600'}`}
                >좋아요 한 글</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeTab === 'my-posts' ? (
                  myPosts.length > 0 ? (
                    myPosts.map(post => (
                      <div key={post.id} onClick={() => navigate('/community')} className="p-5 border border-gray-100 rounded-2xl hover:border-[#3478B8] cursor-pointer transition group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black text-[#3478B8] bg-[#3478B8]/10 px-3 py-1 rounded-full">{post.category}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[#4A4F58] font-black group-hover:text-[#3478B8] transition line-clamp-1">{post.title}</h4>
                        <div className="flex items-center text-xs text-gray-400 font-bold mt-3 space-x-3">
                          <span className="flex items-center"><Activity size={12} className="mr-1" /> {post.views}</span>
                          <span className="flex items-center"><Zap size={12} className="mr-1" /> {post.recommendations}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400 font-bold text-sm bg-gray-50 rounded-2xl">
                      아직 작성한 게시글이 없습니다. 커뮤니티에서 활동해 보세요!
                    </div>
                  )
                ) : (
                  likedPosts.length > 0 ? (
                    likedPosts.map(post => (
                      <div key={post.id} onClick={() => navigate('/community')} className="p-5 border border-gray-100 rounded-2xl hover:border-[#E61E2B] cursor-pointer transition group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black text-[#E61E2B] bg-[#E61E2B]/10 px-3 py-1 rounded-full">{post.category}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-[#4A4F58] font-black group-hover:text-[#E61E2B] transition line-clamp-1">{post.title}</h4>
                        <div className="flex items-center text-xs text-gray-400 font-bold mt-3 space-x-3">
                          <span className="flex items-center"><Activity size={12} className="mr-1" /> {post.views}</span>
                          <span className="flex items-center"><Zap size={12} className="mr-1 text-[#E61E2B]" /> {post.recommendations}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400 font-bold text-sm bg-gray-50 rounded-2xl">
                      아직 좋아요를 누른 게시글이 없습니다. 마음에 드는 글에 추천을 눌러보세요!
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* 우측 사이드 영역 (30%) */}
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black mb-6 flex items-center text-[#4A4F58]"><Calendar className="mr-3 text-[#3478B8]" size={20} /> 준비 중인 시험 (D-Day)</h3>
              {dashboard.targetExam ? (
                <div className="p-6 bg-[#3478B8]/5 border border-[#3478B8]/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-1.5 h-10 bg-[#D9A23A] rounded-full"></div>
                      <div className="text-left">
                        <h4 className="font-bold text-[#4A4F58]">{dashboard.targetExam.certName} ({dashboard.targetExam.examType})</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Exam Date: {dashboard.targetExam.examDate}</p>
                      </div>
                    </div>
                    <div className="text-right"><span className="text-xl font-black text-[#D9A23A]">{dashboard.targetExam.dDay <= 0 ? 'D-Day' : `D-${dashboard.targetExam.dDay}`}</span></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-[#3BAA7D] h-2.5 rounded-full" style={{ width: `${Math.min(100, Number(dashboard.targetExam.achievementRate))}%` }}></div></div>
                  <p className="text-right text-xs text-gray-500 mt-2 font-bold">목표 달성률: {dashboard.targetExam.achievementRate}%</p>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl text-center text-gray-400 font-bold text-sm">목표 시험 일정이 없습니다.</div>
              )}
            </section>

            <section className="bg-[#4A4F58] p-8 rounded-[32px] text-white shadow-xl">
              <h3 className="text-lg font-bold mb-6 flex items-center"><Bookmark className="mr-3 text-[#D9A23A]" size={18} /> 최근 스크랩</h3>
              <div className="space-y-4">
                {dashboard.recentScraps?.length > 0 ? dashboard.recentScraps.map(s => <ScrapItem key={s.id} title={s.title} date="스크랩됨" />) : <p className="text-sm text-gray-400">없음</p>}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 세션(회차) 모달 */}
      {modalState.isOpen && (
        <div className="no-print fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#EAECEF] rounded-[32px] w-full max-w-xl shadow-2xl relative flex flex-col overflow-hidden">
            <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
              <h2 className="text-2xl font-black text-[#4A4F58]">{modalState.date} 학습 기록</h2>
              <button onClick={() => setModalState({ isOpen: false, view: 'sessions', sessions: [], selectedSessionIdx: null, loading: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[60vh] flex flex-col custom-scrollbar">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* 정보 수정 모달 */}
      {isEditModalOpen && (
        <div className="no-print fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-2xl font-black text-[#4A4F58] mb-6">정보 수정</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); setIsEditModalOpen(false) }} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">이름</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">전공</label>
                <select value={editForm.major} onChange={e => setEditForm({ ...editForm, major: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition appearance-none" required>
                  <option value="">전공을 선택하세요</option>
                  <option value="소프트웨어 개발">소프트웨어 개발</option>
                  <option value="정보보안">정보보안</option>
                  <option value="데이터베이스">데이터베이스</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">관심 분야</label>
                <select value={editForm.interest} onChange={e => setEditForm({ ...editForm, interest: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition appearance-none" required>
                  <option value="">관심 분야를 선택하세요</option>
                  <option value="웹 개발">웹 개발 (Front/Back)</option>
                  <option value="앱 개발">앱 개발</option>
                  <option value="인공지능">인공지능 / 데이터 분석</option>
                  <option value="클라우드">클라우드 / 인프라</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">재학 상태</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition appearance-none" required>
                  <option value="">상태를 선택하세요</option>
                  <option value="재학">재학</option>
                  <option value="휴학">휴학</option>
                  <option value="졸업">졸업</option>
                  <option value="취업준비">취업준비</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">새 비밀번호 (변경시에만 입력)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="변경할 비밀번호를 입력하세요" className="w-full border border-gray-200 focus:border-[#3478B8] rounded-xl px-4 py-3 text-sm outline-none transition" />
              </div>
              <button type="submit" className="w-full bg-[#3478B8] text-white font-black py-4 rounded-xl mt-6 hover:bg-[#2e69a3] transition shadow-lg shadow-[#3478B8]/20">
                수정 완료
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 회원탈퇴 모달 */}
      {isWithdrawModalOpen && (
        <div className="no-print fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative text-center">
            <h2 className="text-2xl font-black text-red-500 mb-4">회원탈퇴</h2>
            <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed">
              정말 탈퇴하시겠습니까?<br/>탈퇴 시 모든 학습 기록과 스크랩이 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setIsWithdrawModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition">취소</button>
              <button onClick={handleWithdraw} className="flex-1 py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/20">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-[28px] border border-gray-100 text-center shadow-sm"><div className="flex justify-center mb-3">{icon}</div><p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p><p className="text-2xl font-black text-[#4A4F58]">{value}</p></div>
)
const ScrapItem = ({ title, date }) => (
  <div className="flex justify-between items-center group cursor-pointer"><span className="text-sm font-bold truncate max-w-[180px]">{title}</span><span className="text-[10px] text-gray-400 ml-2">{date}</span></div>
)

export default ProfilePage
