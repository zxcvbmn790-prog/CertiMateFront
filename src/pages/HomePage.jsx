import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, MessageSquare, Info, ArrowRight, Target, FileText, Briefcase, Sparkles, MapPin } from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  const handleNav = (link, options = {}) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.')
      navigate('/login')
    } else {
      navigate(link, options)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col items-center pb-12">
      <div className="max-w-7xl w-full px-4 pt-6 sm:pt-10">
        
        {/* Main Grid: 12 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Box 1 (Left, Col-4) - CBT Mock Exam */}
          <div 
            onClick={() => handleNav('/study')}
            className="md:col-span-4 bg-[#3478B8] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="relative z-10 h-full flex flex-col justify-between min-h-[240px] sm:min-h-[280px]">
              <div>
                <h2 className="text-3xl font-black mb-3 leading-snug">실전 CBT<br/>모의고사</h2>
                <p className="text-blue-100 font-medium text-sm leading-relaxed">과목별 문제를 시험처럼 풀고<br/>바로 채점받으세요!</p>
              </div>
              <div className="space-y-3 mt-6 sm:mt-8">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNav('/study')
                  }}
                  className="w-full flex items-center justify-between border border-white/30 rounded-full px-5 py-3 text-sm font-bold hover:bg-white/10 transition"
                >
                  모의고사 풀기 <ArrowRight size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNav('/profile', { state: { scrollTo: 'wrong-notes' } })
                  }}
                  className="w-full flex items-center justify-between border border-white/30 rounded-full px-5 py-3 text-sm font-bold hover:bg-white/10 transition"
                >
                  내 오답노트 <ArrowRight size={16} />
                </button>
              </div>
            </div>
            {/* Background Icon */}
            <BookOpen className="absolute -bottom-6 -right-6 w-48 h-48 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Box 2 (Middle, Col-4) - Stacked Cards */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 sm:gap-6 md:flex md:flex-col">
            {/* Top - Calendar */}
            <div
              onClick={() => handleNav('/calendar')}
              className="flex-1 bg-[#3BAA7D] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 text-white cursor-pointer group shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-black mb-1 break-keep">시험 일정 캘린더</h3>
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
              className="flex-1 bg-[#D9A23A] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 text-white cursor-pointer group shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <h3 className="text-lg sm:text-xl font-black mb-1 break-keep">내 학습 진도</h3>
                <p className="text-yellow-100 text-xs font-medium">합격을 향한 발자취</p>
              </div>
              <div className="flex justify-between items-end mt-6">
                <span className="text-xs font-bold flex items-center">바로가기 <ArrowRight size={12} className="ml-1" /></span>
                <Target className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Box 3 (Right, Col-4) - Stacked White Cards */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 sm:gap-6 md:flex md:flex-col">
            <div
              onClick={() => handleNav('/community')}
              className="flex-1 bg-white rounded-[28px] sm:rounded-[32px] border border-gray-100 p-5 sm:p-7 cursor-pointer group shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative"
            >
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1 break-keep">커뮤니티</h3>
                <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed break-keep">질문하고, 공부법과 정보를 나눠요</p>
                <span className="text-xs font-bold text-[#3478B8] flex items-center mt-4">바로가기 <ArrowRight size={12} className="ml-1" /></span>
              </div>
              <MessageSquare className="hidden md:block absolute bottom-6 right-6 w-10 h-10 text-gray-100 group-hover:text-[#3478B8] transition-colors" strokeWidth={1.5} />
            </div>

            <div 
              onClick={() => handleNav('/recommend')}
              className="flex-1 bg-white rounded-[28px] sm:rounded-[32px] border border-gray-100 p-5 sm:p-7 cursor-pointer group shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between relative"
            >
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1 break-keep">AI 자격증 추천</h3>
                <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed break-keep">전공·관심사에 맞는 자격증을 추천받아요</p>
                <span className="text-xs font-bold text-[#3BAA7D] flex items-center mt-4">바로가기 <ArrowRight size={12} className="ml-1" /></span>
              </div>
              <Info className="hidden md:block absolute bottom-6 right-6 w-10 h-10 text-gray-100 group-hover:text-[#3BAA7D] transition-colors" strokeWidth={1.5} />
            </div>
          </div>

        </div>

        {/* Bottom Horizontal Quick Links */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-4 sm:px-8 py-6 grid grid-cols-4 gap-y-6 sm:flex sm:flex-wrap sm:justify-between sm:items-center sm:gap-6">
          <QuickLink icon={<Calendar />} label="시험일정" onClick={() => handleNav('/calendar')} />
          <QuickLink icon={<BookOpen />} label="모의고사" onClick={() => handleNav('/study')} />
          <QuickLink icon={<Briefcase />} label="취업연계" onClick={() => handleNav('/jobs')} />
          <QuickLink icon={<FileText />} label="자소서" onClick={() => handleNav('/cover-letter')} />
          <QuickLink icon={<Target />} label="학습진도" onClick={() => handleNav('/profile')} />
          <QuickLink icon={<MessageSquare />} label="커뮤니티" onClick={() => handleNav('/community')} />
          <QuickLink icon={<Sparkles />} label="자격증 추천" onClick={() => handleNav('/recommend')} />
          <QuickLink icon={<MapPin />} label="시험장 찾기" onClick={() => handleNav('/exam-locations')} />
        </div>

      </div>
    </div>
  )
}

const QuickLink = ({ icon, label, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-3 cursor-pointer group sm:min-w-[70px]">
    <div className="text-gray-400 group-hover:text-[#3478B8] transition-colors">
      {icon}
    </div>
    <span className="text-[11px] font-black text-slate-600 group-hover:text-[#3478B8] transition-colors">{label}</span>
  </div>
)

export default HomePage
