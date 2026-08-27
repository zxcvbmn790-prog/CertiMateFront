import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Mail, Lock, ChevronRight } from 'lucide-react'
import { authApi } from '../api/authApi'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const navigate = useNavigate()

  // 이메일 로그인 처리 및 로컬스토리지 저장
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      await authApi.login({ email, password: pw })
      alert('로그인에 성공했습니다!')

      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('loginTime', new Date().getTime())

      window.location.href = '/'
    } catch (error) {
      alert('로그인 실패: 이메일이나 비밀번호를 확인해주세요.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EAECEF] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 transition-all">
        <div className="bg-[#3478B8] p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Award size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">자격한판 로그인</h2>
          <p className="text-[#EAECEF]/70 text-xs mt-2 font-medium tracking-tight">지능형 자격증 플랫폼에 다시 오신 것을 환영합니다.</p>
        </div>

        <div className="p-10 space-y-8">
          {/* 환경변수 활용 카카오 로그인 */}
          <button
            type="button"
            onClick={() => {
              const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY
              const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI
              window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`
            }}
            className="w-full bg-[#FEE500] text-[#3c1e1e] py-4 rounded-xl font-bold flex items-center justify-center shadow-sm hover:opacity-90 transition transform active:scale-[0.98]"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="kakao" className="w-5 h-5 mr-3" />
            카카오톡으로 간편 로그인
          </button>

          {/* 환경변수 활용 구글 로그인 */}
          <button
            type="button"
            onClick={() => {
              const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
              const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI
              const scope = encodeURIComponent('openid email profile')
              window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`
            }}
            className="w-full bg-white text-[#3c4043] border border-gray-300 py-4 rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-gray-50 transition transform active:scale-[0.98]"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google로 간편 로그인
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-100 w-full"></div>
            <span className="bg-white px-4 text-[10px] text-gray-300 font-black uppercase tracking-widest absolute">Or Email Login</span>
          </div>

          <form className="space-y-5" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력합니다"
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/find-password" className="text-[10px] text-[#3478B8] font-bold hover:underline">비밀번호 찾기</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                  placeholder="비밀번호를 입력합니다"
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#3478B8] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#3478B8]/20 hover:bg-[#2e69a3] transition transform active:scale-[0.98] flex items-center justify-center">
              로그인하기 <ChevronRight size={18} className="ml-1" />
            </button>
          </form>

          <p className="text-center text-[11px] font-bold text-gray-300">
            아직 계정이 없으신가요?
            <Link to="/register" className="text-[#3478B8] underline ml-1 hover:text-[#2e69a3] transition">
              회원가입 시작하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
