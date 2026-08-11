import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Send, Lock } from 'lucide-react'

const FindPasswordPage = () => {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleFindPassword = (e) => {
    e.preventDefault()
    if (!email) {
      alert('이메일을 입력해주세요.')
      return
    }
    // 백엔드 API 연동 전 껍데기 로직
    alert(`입력하신 [${email}] 로 임시 비밀번호를 발송했습니다. (기능 준비중)`)
    navigate('/login')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EAECEF] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center mt-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-[#3478B8]" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">비밀번호 찾기</h2>
          <p className="text-gray-400 text-xs mt-2 font-medium">가입하신 이메일 주소를 입력하시면<br/>임시 비밀번호를 보내드립니다.</p>
        </div>

        <div className="px-10 pb-10 space-y-6">
          <form className="space-y-4" onSubmit={handleFindPassword}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="가입한 이메일을 입력하세요"
                  className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-[#3478B8] transition text-sm font-medium"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#3478B8] text-white py-4 rounded-xl font-black shadow-md hover:bg-[#2a6296] transition flex items-center justify-center">
              <Send size={18} className="mr-2" /> 임시 비밀번호 받기
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center text-sm font-bold text-gray-400 hover:text-[#3478B8] transition mt-6">
            <ArrowLeft size={16} className="mr-1" /> 로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FindPasswordPage
