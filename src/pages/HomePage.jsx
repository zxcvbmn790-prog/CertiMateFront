import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, MessageSquare, User, Info, Phone, ArrowRight, Target } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  const handleNav = (link) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.')
      navigate('/login')
    } else {
      navigate(link)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center pb-12">
      {/* Top Banner */}
      <div className="w-full bg-[#3478B8]/10 py-3 flex justify-center items-center text-sm font-bold text-[#3478B8]">
        <span className="bg-[#3478B8] text-white px-2 py-0.5 rounded text-xs mr-3">안내</span>
        [공지] 2026년 하반기 정보처리기사 실기 시험 접수 안내
        <span className="ml-4 text-xs font-normal underline cursor-pointer">자세히보기 &gt;</span>
      </div>

      <div className="max-w-7xl w-full px-4 pt-10">
        
        {/* Main Grid: 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          
          {/* Box 1 (Left, Col-4) - CBT Mock Exam */}
          <div 
            onClick={() => handleNav('/study')}
            className="md:col-span-4 bg-[#3478B8] rounded-[32px] p-8 text-white relative overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[280px]">
              <div>
                <h2 className="text-3xl font-black mb-3 leading-snug">실전 CBT<br/>모의고사</h2>
                <p className="text-blue-100 font-medium text-sm leading-relaxed">CertiMate에서 기출문제를<br/>더 완벽하게 준비하세요!</p>
              </div>
              <div className="space-y-3 mt-8">
                <button className="w-full flex items-center justify-between border border-white/30 rounded-full px-5 py-3 text-sm font-bold hover:bg-white/10 transition">
                  기출문제 풀기 <ArrowRight size={16} />
                </button>
                <button className="w-full flex items-center justify-between border border-white/30 rounded-full px-5 py-3 text-sm font-bold hover:bg-white/10 transition">
                  내 오답노트 <ArrowRight size={16} />
                </button>
              </div>
            </div>
            {/* Background Icon */}
            <BookOpen className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Box 2 (Middle, Col-3) - Stacked Cards */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Top - Calendar */}
            <div 
              onClick={() => handleNav('/calendar')}
              className="flex-1 bg-[#3BAA7D] rounded-[32px] p-7 text-white cursor-pointer group shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <h3 className="text-xl font-black mb-1">시험 일정 캘린더</h3>
                <p className="text-green-100 text-xs font-medium">놓치기 쉬운 일정 한눈에</p>
              </div>
              <div className="flex justify-between items-end mt-6">
                <span className="text-xs font-bold flex items-center">바로가기 <ArrowRight size={12} className="ml-1" /></span>
                <Calendar className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              </div>
            </div>
            {/* Bottom - My Progress */}
            <div 
              onClick={() => handleNav('/profile')}
              className="flex-1 bg-[#D9A23A] rounded-[32px] p-7 text-white cursor-pointer group shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <h3 className="text-xl font-black mb-1">내 학습 진도</h3>
                <p className="text-yellow-100 text-xs font-medium">합격을 향한 발자취</p>
              </div>
              <div className="flex justify-between items-end mt-6">
                <span className="text-xs font-bold flex items-center">바로가기 <ArrowRight size={12} className="ml-1" /></span>
                <Target className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Box 3 (Right-Middle, Col-3) - Stacked White Cards */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div 
              onClick={() => handleNav('/community')}
              className="flex-1 bg-white rounded-[32px] border border-gray-100 p-7 cursor-pointer group shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative"
            >
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1">합격 후기 게시판</h3>
                <div className="flex flex-col gap-1 mt-4">
                  <span className="text-xs text-gray-500 font-medium flex items-center hover:text-[#3478B8]">선배들의 공부법 <ArrowRight size={10} className="ml-1"/></span>
                  <span className="text-xs text-gray-500 font-medium flex items-center hover:text-[#3478B8]">생생한 합격수기 <ArrowRight size={10} className="ml-1"/></span>
                </div>
              </div>
              <MessageSquare className="absolute bottom-6 right-6 w-10 h-10 text-gray-100 group-hover:text-[#3478B8] transition-colors" strokeWidth={1.5} />
            </div>

            <div 
              onClick={() => handleNav('/recommend')}
              className="flex-1 bg-white rounded-[32px] border border-gray-100 p-7 cursor-pointer group shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative"
            >
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-1">추천 자격증 종목</h3>
                <div className="flex flex-col gap-1 mt-4">
                  <span className="text-xs text-gray-500 font-medium flex items-center hover:text-[#3BAA7D]">IT 자격증 정보 <ArrowRight size={10} className="ml-1"/></span>
                  <span className="text-xs text-gray-500 font-medium flex items-center hover:text-[#3BAA7D]">국가공인 자격증 <ArrowRight size={10} className="ml-1"/></span>
                </div>
              </div>
              <Info className="absolute bottom-6 right-6 w-10 h-10 text-gray-100 group-hover:text-[#3BAA7D] transition-colors" strokeWidth={1.5} />
            </div>
          </div>

          {/* Box 4 (Right-most, Col-2) - Notice / Ranking List */}
          <div className="md:col-span-2 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-slate-800">인기 자격증</h3>
              <span className="text-gray-400 cursor-pointer hover:text-slate-800">+</span>
            </div>
            <div className="flex flex-col gap-5 mt-2">
              {[
                { name: '정보처리기사', isNew: true },
                { name: 'SQL 개발자 (SQLD)', isNew: true },
                { name: '데이터분석 (ADsP)', isNew: false },
                { name: '리눅스마스터 1급', isNew: false },
                { name: '네트워크관리사', isNew: false }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center cursor-pointer group">
                  <span className="text-xs font-bold text-gray-600 group-hover:text-[#3478B8] truncate pr-2">
                    {idx + 1}. {item.name}
                  </span>
                  {item.isNew && <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full text-[8px] font-black flex items-center justify-center flex-shrink-0">N</span>}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Horizontal Quick Links */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-6 flex flex-wrap justify-center sm:justify-between items-center gap-6">
          <QuickLink icon={<Calendar />} label="시험일정" onClick={() => handleNav('/calendar')} />
          <QuickLink icon={<BookOpen />} label="모의고사" onClick={() => handleNav('/study')} />
          <QuickLink icon={<Target />} label="학습진도" onClick={() => handleNav('/profile')} />
          <QuickLink icon={<MessageSquare />} label="합격후기" onClick={() => handleNav('/community')} />
          <QuickLink icon={<Info />} label="자료실" onClick={() => {}} />
          <QuickLink icon={<Phone />} label="고객지원" onClick={() => {}} />
        </div>

      </div>
    </div>
  )
}

const QuickLink = ({ icon, label, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-3 cursor-pointer group min-w-[70px]">
    <div className="text-gray-400 group-hover:text-[#3478B8] transition-colors">
      {icon}
    </div>
    <span className="text-[11px] font-black text-slate-600 group-hover:text-[#3478B8] transition-colors">{label}</span>
  </div>
)

export default HomePage
