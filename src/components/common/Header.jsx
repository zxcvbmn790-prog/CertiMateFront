import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/authApi'

function Header() {
  const navigate = useNavigate()
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
    <nav className="sticky top-0 z-50 bg-white border-b border-[#DDDDDD] font-sans">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-extrabold text-[#FF385C] tracking-tighter mr-6">
              CertiMate
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link to="/study" className="text-sm font-medium text-[#717171] hover:text-[#222222] px-3 py-2 rounded-[8px] hover:bg-[#F7F7F7] transition-colors">모의고사</Link>
              <Link to="/exam-locations" className="text-sm font-medium text-[#717171] hover:text-[#222222] px-3 py-2 rounded-[8px] hover:bg-[#F7F7F7] transition-colors">시험장 찾기</Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-[12px] text-[#222222] font-bold bg-[#F7F7F7] border border-[#DDDDDD] px-3 py-1.5 rounded-[8px] font-mono flex items-center">
                  <span className="mr-2 text-[#717171] font-medium font-sans">접속시간</span> {elapsedTime}
                </span>
                <Link to="/profile" className="text-sm font-medium text-[#717171] hover:text-[#222222] px-3 py-2">
                  내정보
                </Link>
                <button
                  onClick={() => handleLogout()}
                  className="text-sm font-semibold bg-white border border-[#DDDDDD] text-[#222222] px-4 py-2 rounded-[8px] hover:bg-[#F7F7F7] transition-colors"
                >
                  로그아웃
                </button>
                <Link to="/profile" title="내정보" className="shrink-0">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-[#DDDDDD] hover:ring-2 hover:ring-[#FF385C] transition"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-[#FF385C]/10 text-[#FF385C] font-black flex items-center justify-center border border-[#FF385C]/20">
                      {(profile.name || 'U').charAt(0)}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <>
                <Link to="/register" className="text-sm font-medium text-[#717171] hover:text-[#222222] px-3 py-2">
                  회원가입
                </Link>
                <Link to="/login" className="text-sm font-semibold bg-[#FF385C] text-white px-5 py-2.5 rounded-[8px] hover:bg-[#D90B3E] transition-colors">
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
