import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

const GoogleCallbackPage = () => {
  const navigate = useNavigate()
  const calledRef = useRef(false)

  useEffect(() => {
    // StrictMode 이중 실행 방지: auth code는 1회용이라 두 번 교환하면 두 번째가 실패한다
    if (calledRef.current) return
    calledRef.current = true

    const code = new URL(window.location.href).searchParams.get('code')

    const sendGoogleCode = async () => {
      try {
        await authApi.googleLogin(code)
        alert('구글 로그인에 성공했습니다!')

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('loginTime', new Date().getTime())

        window.location.href = '/' // 홈으로 이동하며 상단바 갱신
      } catch (error) {
        console.error('구글 로그인 실패:', error)
        alert('구글 로그인에 실패했습니다.')
        navigate('/login')
      }
    }

    if (code) {
      sendGoogleCode()
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAECEF]">
      <h2 className="text-xl font-bold text-gray-600">구글 로그인 처리 중입니다... 잠시만 기다려주세요. 🚀</h2>
    </div>
  )
}

export default GoogleCallbackPage
