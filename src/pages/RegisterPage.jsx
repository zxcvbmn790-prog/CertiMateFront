import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Mail, Lock, User, BookOpen, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../api/authApi'

const RegisterPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '', pw: '', confirmPw: '', uname: '', major: '', agreeConsent: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!isValidEmail(formData.email)) {
      alert('정확한 이메일 형식으로 입력해주세요.'); return
    }
    if (formData.pw !== formData.confirmPw) {
      alert('비밀번호가 일치하지 않습니다.'); return
    }
    if (!formData.agreeConsent) {
      alert('개인정보 수집 및 이용에 동의해주세요.'); return
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.pw,
        name: formData.uname,
        major: formData.major,
        interest: '미입력',
        status: '미입력',
        agreeConsent: formData.agreeConsent
      }
      await authApi.register(payload)
      alert('회원가입이 완료되었습니다! 로그인해주세요.')
      navigate('/login')
    } catch (error) {
      alert('회원가입 실패: 입력 정보를 다시 확인해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-[#EAECEF] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#3478B8] p-10 text-center text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">자격한판 시작하기</h2>
          <p className="text-[#EAECEF]/70 text-xs mt-2 font-medium">지능형 자격증 플랫폼에 오신 것을 환영합니다.</p>
        </div>

        <div className="p-10 space-y-8">
          {/* .env 환경변수를 활용한 카카오 연동 */}
          <button
            type="button"
            onClick={() => {
              const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY
              const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI
              window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`
            }}
            className="w-full bg-[#FEE500] text-[#3c1e1e] py-4 rounded-xl font-bold flex items-center justify-center shadow-sm hover:opacity-90 transition"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" alt="kakao" className="w-5 h-5 mr-3" />
            카카오로 1초 만에 시작하기
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-100 w-full"></div>
            <span className="bg-white px-4 text-[10px] text-gray-300 font-bold uppercase tracking-widest absolute">Or Email Join</span>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="text" name="uname" value={formData.uname} onChange={handleChange} placeholder="실명을 입력합니다" className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일 주소를 입력합니다" className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium" required />
              </div>
              {formData.email.length > 0 && !isValidEmail(formData.email) ? (
                <p className="text-[10px] text-red-500 font-bold ml-2">* 정확한 이메일 형식으로 입력해주세요.</p>
              ) : formData.email.length > 0 && isValidEmail(formData.email) ? (
                <p className="text-[10px] text-[#3478B8] font-bold ml-2">* 올바른 이메일 형식입니다.</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type={showPassword ? 'text' : 'password'} name="pw" value={formData.pw} onChange={handleChange} placeholder="비밀번호" className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 pr-10 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3478B8]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Confirm</label>
                <div className="relative">
                  <input type={showPasswordConfirm ? 'text' : 'password'} name="confirmPw" value={formData.confirmPw} onChange={handleChange} placeholder="재입력" className="w-full bg-gray-50 border border-gray-100 p-4 pr-10 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium" required />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3478B8]">
                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            {formData.confirmPw.length > 0 && formData.pw !== formData.confirmPw ? (
              <p className="text-[10px] text-red-500 font-bold ml-2">* 비밀번호가 일치하지 않습니다.</p>
            ) : formData.confirmPw.length > 0 && formData.pw === formData.confirmPw ? (
              <p className="text-[10px] text-green-500 font-bold ml-2">* 비밀번호가 일치합니다.</p>
            ) : null}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Academic Major</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <select name="major" value={formData.major} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] appearance-none text-sm font-medium text-gray-500" required>
                  <option value="">전공을 선택합니다</option>
                  <option value="소프트웨어 개발">소프트웨어 개발</option>
                  <option value="정보보안">정보보안</option>
                  <option value="데이터베이스">데이터베이스</option>
                </select>
              </div>
            </div>

            <div
              onClick={() => setFormData({ ...formData, agreeConsent: !formData.agreeConsent })}
              className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer group"
            >
              <CheckCircle size={18} className={`transition ${formData.agreeConsent ? 'text-[#3BAA7D]' : 'text-gray-200 group-hover:text-[#3BAA7D]'}`} />
              <span className="ml-3 text-[11px] font-bold text-gray-400 leading-tight">
                개인정보 수집 및 이용에 동의합니다 (필수)
              </span>
            </div>

            <button type="submit" className="w-full bg-[#3478B8] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#3478B8]/20 hover:bg-[#2e69a3] transition transform active:scale-[0.98]">
              가입 완료하기
            </button>
          </form>

          <p className="text-center text-[11px] font-bold text-gray-300">
            이미 계정이 있으신가요? <Link to="/login" className="text-[#3478B8] underline ml-1">로그인하기</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
