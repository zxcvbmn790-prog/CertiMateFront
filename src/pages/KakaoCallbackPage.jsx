import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

const KakaoCallbackPage = () => {
  const navigate = useNavigate()
  const calledRef = useRef(false)

  useEffect(() => {
    // StrictMode 이중 실행 방지: auth code는 1회용이라 두 번 교환하면 두 번째가 실패한다
    if (calledRef.current) return
    calledRef.current = true

    const code = new URL(window.location.href).searchParams.get('code')

    const sendKakaoCode = async () => {
      try {
        await authApi.kakaoLogin(code)
        // 로그인 상태 도장 + 시간
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('loginTime', new Date().getTime())
        window.location.href = '/' // 홈으로 이동하며 상단바 갱신 (성공 알림 없이 매끄럽게)
      } catch (error) {
        console.error('카카오 로그인 실패:', error)
        alert('카카오 로그인에 실패했습니다.')
        navigate('/login')
      }
    }

    if (code) {
      sendKakaoCode()
    }
  }, [navigate])

  // 대기 페이지 없이 최소 스피너만 (코드 교환은 순식간, 곧 홈으로 리다이렉트)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAECEF]">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-[#3478B8] rounded-full animate-spin" />
    </div>
  )
}

export default KakaoCallbackPage
