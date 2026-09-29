import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, MessageSquare, User, Info, Phone, ArrowRight, Target, FileText } from 'lucide-react'

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
    <div className="w-full min-h-[calc(100vh-64px)] bg-white flex flex-col items-center pb-16 font-sans text-[#222222] tracking-normal">
      {/* Top Banner */}
      <div className="w-full bg-[#F7F7F7] border-b border-[#DDDDDD] py-2.5 flex justify-center items-center text-[13px] font-medium text-[#222222]">
        <span className="bg-[#222222] text-white px-2.5 py-1 text-[11px] font-bold mr-3 rounded-[8px]">Notice</span>
        [공지] 2026년 하반기 정보처리기사 실기 시험 접수 안내.
        <span className="ml-3 text-[13px] text-[#717171] cursor-pointer font-bold underline decoration-1 underline-offset-2 hover:text-[#222222] transition-colors">자세히보기</span>
      </div>

      <div className="max-w-[1200px] w-full px-4 pt-10" style={{ zoom: 1.5 }}>
        
        {/* 1. Hero Section (CBT) */}
        <div 
          onClick={() => handleNav('/study')}
          className="w-full bg-[#222222] text-white rounded-[12px] p-10 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden cursor-pointer group shadow-sm"
        >
          <div className="relative z-10 md:w-2/3">
            <h2 className="text-[36px] md:text-[44px] font-bold mb-4 leading-[1.1] tracking-tight">실전 CBT 모의고사.</h2>
            <p className="text-[#DDDDDD] font-normal text-[16px] md:text-[18px] mb-8">CertiMate에서 실제 시험과 똑같은 환경으로 완벽하게 대비하세요.</p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-[#FF385C] text-white px-6 py-3.5 rounded-[10px] text-[14px] font-bold hover:bg-[#D90B3E] transition flex items-center gap-2">
                기출문제 풀기 <ArrowRight size={16} />
              </button>
              <button className="bg-transparent border border-[#717171] text-white px-6 py-3.5 rounded-[10px] text-[14px] font-bold hover:bg-[#484848] transition">
                내 오답노트
              </button>
            </div>
          </div>
          {/* Background Hero Icon */}
          <BookOpen className="absolute -bottom-16 -right-16 w-80 h-80 text-white/10 group-hover:scale-105 transition-transform duration-700" strokeWidth={1} />
        </div>

        {/* 2. Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column (Bento Cards 2x2) */}
          <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Calendar */}
            <div 
              onClick={() => handleNav('/calendar')}
              className="col-span-1 bg-white border border-[#DDDDDD] rounded-[12px] p-7 flex flex-col justify-between h-[220px] cursor-pointer group hover:border-[#222222] transition-colors"
            >
              <div>
                <Calendar className="w-8 h-8 text-[#222222] mb-4" strokeWidth={1.5} />
                <h3 className="text-[20px] font-bold mb-1.5 tracking-tight text-[#222222]">시험 일정 캘린더</h3>
                <p className="text-[#717171] text-[14px] font-medium leading-snug">놓치기 쉬운 주요 일정 확인</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-bold underline decoration-2 underline-offset-4 group-hover:text-[#FF385C]">바로가기</span>
                <ArrowRight className="w-5 h-5 text-[#222222] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 group-hover:text-[#FF385C]" />
              </div>
            </div>

            {/* Progress */}
            <div 
              onClick={() => handleNav('/profile')}
              className="col-span-1 bg-white border border-[#DDDDDD] rounded-[12px] p-7 flex flex-col justify-between h-[220px] cursor-pointer group hover:border-[#222222] transition-colors"
            >
              <div>
                <Target className="w-8 h-8 text-[#222222] mb-4" strokeWidth={1.5} />
                <h3 className="text-[20px] font-bold mb-1.5 tracking-tight text-[#222222]">내 학습 진도</h3>
                <p className="text-[#717171] text-[14px] font-medium leading-snug">합격을 향한 학습 발자취</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-bold underline decoration-2 underline-offset-4 group-hover:text-[#FF385C]">바로가기</span>
                <ArrowRight className="w-5 h-5 text-[#222222] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 group-hover:text-[#FF385C]" />
              </div>
            </div>

            {/* Community */}
            <div 
              onClick={() => handleNav('/community')}
              className="col-span-1 bg-white border border-[#DDDDDD] rounded-[12px] p-7 flex flex-col justify-between h-[220px] cursor-pointer group hover:border-[#222222] transition-colors"
            >
              <div>
                <MessageSquare className="w-8 h-8 text-[#222222] mb-4" strokeWidth={1.5} />
                <h3 className="text-[20px] font-bold mb-1.5 tracking-tight text-[#222222]">합격 후기 게시판</h3>
                <p className="text-[#717171] text-[14px] font-medium leading-snug">생생한 합격 수기와 공부법</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-bold underline decoration-2 underline-offset-4 group-hover:text-[#FF385C]">바로가기</span>
                <ArrowRight className="w-5 h-5 text-[#222222] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 group-hover:text-[#FF385C]" />
              </div>
            </div>

            {/* Recommend */}
            <div 
              onClick={() => handleNav('/recommend')}
              className="col-span-1 bg-white border border-[#DDDDDD] rounded-[12px] p-7 flex flex-col justify-between h-[220px] cursor-pointer group hover:border-[#222222] transition-colors"
            >
              <div>
                <Info className="w-8 h-8 text-[#222222] mb-4" strokeWidth={1.5} />
                <h3 className="text-[20px] font-bold mb-1.5 tracking-tight text-[#222222]">추천 자격증</h3>
                <p className="text-[#717171] text-[14px] font-medium leading-snug">나에게 맞는 자격증 찾기</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[14px] font-bold underline decoration-2 underline-offset-4 group-hover:text-[#FF385C]">바로가기</span>
                <ArrowRight className="w-5 h-5 text-[#222222] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 group-hover:text-[#FF385C]" />
              </div>
            </div>

          </div>

          {/* Right Column (Tall Ranking Box) */}
          <div className="md:col-span-3 bg-[#F7F7F7] border border-[#DDDDDD] rounded-[12px] p-7 flex flex-col relative h-full">
            <h3 className="text-[18px] font-bold mb-6 tracking-tight text-[#222222] flex items-center justify-between">
              인기 자격증
              <span className="text-[12px] font-normal text-[#717171] cursor-pointer hover:text-[#222222] transition-colors">더보기 +</span>
            </h3>
            <div className="flex flex-col gap-5 flex-1 justify-center">
              {[
                { name: '정보처리기사', isNew: true },
                { name: 'SQL 개발자', isNew: true },
                { name: '데이터분석', isNew: false },
                { name: '리눅스마스터', isNew: false },
                { name: '네트워크관리사', isNew: false }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center cursor-pointer group pb-4 border-b border-[#DDDDDD] last:border-0 last:pb-0">
                  <span className="text-[14px] font-medium text-[#222222] truncate pr-2 group-hover:underline decoration-1 underline-offset-4 group-hover:text-[#FF385C]">
                    <span className="font-bold mr-2 text-[#717171] group-hover:text-[#FF385C]">{idx + 1}</span> {item.name}
                  </span>
                  {item.isNew && <span className="px-2 py-0.5 bg-[#FF385C] text-white rounded-[8px] text-[9px] font-extrabold tracking-wider">NEW</span>}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Bottom Quick Links (Footer-like bar) */}
        <div className="w-full mt-6 bg-white border border-[#DDDDDD] rounded-[12px] px-8 py-4 flex justify-between items-center overflow-x-auto scrollbar-hide gap-6">
          <QuickLink icon={<Calendar size={18} />} label="시험일정" onClick={() => handleNav('/calendar')} />
          <QuickLink icon={<BookOpen size={18} />} label="모의고사" onClick={() => handleNav('/study')} />
          <QuickLink icon={<FileText size={18} />} label="자소서" onClick={() => handleNav('/cover-letter')} />
          <QuickLink icon={<Target size={18} />} label="학습진도" onClick={() => handleNav('/profile')} />
          <QuickLink icon={<MessageSquare size={18} />} label="합격후기" onClick={() => handleNav('/community')} />
          <QuickLink icon={<Info size={18} />} label="자료실" onClick={() => {}} />
          <QuickLink icon={<Phone size={18} />} label="고객지원" onClick={() => {}} />
        </div>

      </div>
    </div>
  )
}

const QuickLink = ({ icon, label, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-2.5 cursor-pointer group whitespace-nowrap px-2">
    <div className="text-[#717171] group-hover:text-[#222222] transition-colors">
      {icon}
    </div>
    <span className="text-[14px] font-bold text-[#717171] group-hover:text-[#222222] transition-colors">{label}</span>
  </div>
)

export default HomePage
