import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const loginTime = localStorage.getItem('loginTime')

      if (loggedIn && loginTime) {
        setIsLoggedIn(true)

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
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-blue-600 text-2xl">📘</span>
              <span className="text-xl font-extrabold text-blue-600 tracking-tighter">
                CertiMate
              </span>
            </Link>
            <div className="hidden sm:flex items-center ml-6 gap-1">
              <Link to="/study" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">모의고사</Link>
              <Link to="/exam-locations" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">시험장 찾기</Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/admin" className="text-xs font-medium text-slate-500 border border-slate-300 rounded-full px-3 py-1.5 hover:bg-slate-50 transition">
                  ADMIN MODE
                </Link>

                <span className="text-[12px] text-[#3478B8] font-bold bg-[#3478B8]/10 px-3 py-1.5 rounded-full font-mono flex items-center">
                  <span className="mr-1 text-gray-500">접속시간</span> {elapsedTime}
                </span>
                <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  내정보
                </Link>
                <button
                  onClick={() => handleLogout()}
                  className="text-sm font-semibold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
                  회원가입
                </Link>
                <Link to="/login" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
