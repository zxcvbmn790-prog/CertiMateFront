import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { authApi } from '../../api/authApi'

const MOBILE_LINKS = [
  { to: '/study', label: '모의고사' },
  { to: '/exam-locations', label: '시험장 찾기' },
  { to: '/jobs', label: '취업 연계' },
  { to: '/calendar', label: '시험 일정' },
  { to: '/recommend', label: '자격증 추천' },
  { to: '/cover-letter', label: '자소서 작성' },
  { to: '/community', label: '커뮤니티' },
  { to: '/profile', label: '내정보' },
]

function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const [profile, setProfile] = useState({ name: '', profileImage: null })

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const loginTime = localStorage.getItem('loginTime')

      if (loggedIn && loginTime) {
        setIsLoggedIn(true)

        // 로그인 상태면 내 정보(프로필 사진) 불러와 아바타 표시
        authApi.getMe()
          .then((res) => setProfile({ name: res.data.name || '', profileImage: res.data.profileImage || null }))
          .catch(() => {})

        const timer = setInterval(() => {
          const now = new Date().getTime()
          const diff = now - parseInt(loginTime)
          const twoHours = 2 * 60 * 60 * 1000

          if (diff >= twoHours) {
            clearInterval(timer)
            handleLogout('보안을 위해 2시간이 경과하여 자동 로그아웃 되었습니다.')
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0')
            const minutes = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0')
            const seconds = Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
            setElapsedTime(`${hours}:${minutes}:${seconds}`)
          }
        }, 1000)

        return () => clearInterval(timer)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = (message = '로그아웃 되었습니다.') => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('loginTime')
    setIsLoggedIn(false)
    alert(message)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" onClick={closeMenu} className="text-xl font-extrabold text-blue-600 tracking-tighter mr-6">
              CertiMate
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link to="/study" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">모의고사</Link>
              <Link to="/exam-locations" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">시험장 찾기</Link>
              <Link to="/jobs" className="text-sm font-bold text-[#3478B8] hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50/60 transition flex items-center gap-1">
                취업 연계
                <span className="text-[10px] font-black bg-[#3BAA7D] text-white px-1.5 py-0.5 rounded-full">LIVE</span>
              </Link>
              <Link to="/cover-letter" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">자기소개서</Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden md:flex text-[12px] text-[#3478B8] font-bold bg-[#3478B8]/10 px-3 py-1.5 rounded-full font-mono items-center">
                  <span className="mr-1 text-gray-500">접속시간</span> {elapsedTime}
                </span>
                <Link to="/profile" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  내정보
                </Link>
                <button
                  onClick={() => handleLogout()}
                  className="hidden sm:block text-sm font-semibold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  로그아웃
                </button>
                <Link to="/profile" onClick={closeMenu} title="내정보" className="shrink-0">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-blue-400 transition"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center border border-slate-200">
                      {(profile.name || 'U').charAt(0)}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <>
                <Link to="/register" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  회원가입
                </Link>
                <Link to="/login" onClick={closeMenu} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  로그인
                </Link>
              </>
            )}
            {/* 모바일 전용 메뉴 버튼 */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="sm:hidden p-2 -mr-2 text-slate-600 rounded-lg hover:bg-slate-50"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="px-4 py-3 flex flex-col">
            {MOBILE_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={closeMenu}
                className="text-[15px] font-semibold text-slate-700 px-3 py-3 rounded-lg hover:bg-slate-50"
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-3 flex items-center justify-between px-3">
              {isLoggedIn ? (
                <>
                  <span className="text-[12px] text-[#3478B8] font-bold font-mono">
                    <span className="mr-1 text-gray-500">접속시간</span> {elapsedTime}
                  </span>
                  <button
                    onClick={() => handleLogout()}
                    className="text-sm font-semibold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link to="/register" onClick={closeMenu} className="text-sm font-semibold text-slate-600 py-2">
                  회원가입
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Header
