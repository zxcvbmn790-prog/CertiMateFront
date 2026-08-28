import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/userApi'
import {
  Calendar as CalIcon, MapPin, Navigation,
  Search, ChevronLeft, ChevronRight,
  Clock, BellRing, Info
} from 'lucide-react'
import ExamLocationMap from '../components/ExamLocationMap'

const CalendarPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('mine');
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    userApi.getDashboard().then(res => setDashboard(res.data)).catch(console.error);
  }, []);

  const mySchedules = dashboard?.targetExam ? [
    { 
      id: 1, 
      name: `${dashboard.targetExam.certName} (${dashboard.targetExam.examType})`, 
      date: dashboard.targetExam.examDate, 
      dday: dashboard.targetExam.dDay <= 0 ? 'D-Day' : `D-${dashboard.targetExam.dDay}`, 
      type: 'exam', 
      color: '#D9A23A',
      examDateObj: new Date(dashboard.targetExam.examDate)
    }
  ] : [];

  // 현재 선택된 고사장 상태 관리 (기본값 설정)
  const [selectedLocation, setSelectedLocation] = useState({
    centerName: '서울디지털대학교',
    address: '서울 강서구 화곡로 302'
  })

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* 상단 헤더 및 필터 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#4A4F58] flex items-center">
            <CalIcon className="mr-3 text-[#3478B8]" size={32} />
            스마트 일정 관리
          </h2>
          <p className="text-gray-400 font-medium mt-1">개인별 맞춤 시험 일정과 고사장 위치를 확인합니다.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveFilter('mine')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition ${activeFilter === 'mine' ? 'bg-[#3478B8] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            내 일정 (Scrapped)
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition ${activeFilter === 'all' ? 'bg-[#3478B8] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            전체 시험 일정
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 1. 메인 캘린더 섹션 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black flex items-center">
                {mySchedules.length > 0 && mySchedules[0].examDateObj ? `${mySchedules[0].examDateObj.getFullYear()}년 ${mySchedules[0].examDateObj.getMonth() + 1}월` : '2026년 5월'}
              </h3>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400"><ChevronLeft size={20}/></button>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400"><ChevronRight size={20}/></button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(31)].map((_, i) => {
                const day = i + 1
                const examObj = mySchedules.find(s => s.examDateObj && s.examDateObj.getDate() === day);
                const isExam = !!examObj;
                const isReg = false;
                return (
                  <div key={i} className={`h-28 p-3 rounded-2xl border transition group cursor-pointer ${
                    isExam ? 'bg-[#D9A23A]/5 border-[#D9A23A]/30' :
                    isReg ? 'bg-[#3478B8]/5 border-[#3478B8]/30' :
                    'bg-gray-50 border-transparent hover:border-gray-200'
                  }`}>
                    <span className={`text-sm font-black ${isExam ? 'text-[#D9A23A]' : isReg ? 'text-[#3478B8]' : 'text-gray-400'}`}>
                      {day}
                    </span>
                    {isReg && <div className="mt-2 text-[9px] font-black bg-[#3478B8] text-white p-1.5 rounded-lg leading-tight">접수 시작</div>}
                    {isExam && <div className="mt-2 text-[9px] font-black bg-[#D9A23A] text-white p-1.5 rounded-lg leading-tight">필기 시험</div>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex space-x-6">
              <div className="flex items-center text-[10px] font-bold text-gray-400">
                <div className="w-3 h-3 bg-[#3478B8] rounded-full mr-2"></div> 원서접수
              </div>
              <div className="flex items-center text-[10px] font-bold text-gray-400">
                <div className="w-3 h-3 bg-[#D9A23A] rounded-full mr-2"></div> 시험일
              </div>
            </div>
            <button className="text-[10px] font-black text-[#3478B8] flex items-center hover:underline">
              <BellRing size={14} className="mr-1" /> 알림 설정 관리
            </button>
          </div>
        </div>

        {/* 2. 사이드바: D-Day 및 고사장 안내 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#4A4F58] p-8 rounded-[32px] text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center tracking-tight">
              <Clock className="mr-2 text-[#3BAA7D]" size={18} /> 다가오는 일정
            </h3>
            <div className="space-y-4">
              {mySchedules.map(item => (
                <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold group-hover:text-[#3BAA7D] transition-colors">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{item.date}</p>
                    </div>
                    <span className="text-xs font-black" style={{ color: item.color }}>{item.dday}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 고사장 검색 위젯 */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center">
                <Search className="mr-2 text-[#3478B8]" size={18} /> 고사장 검색
              </h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-4 font-bold">지역명을 검색하거나 선택하여 고사장을 찾아보세요.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const val = e.target.search.value.trim();
              if (val) navigate(`/exam-locations?query=${encodeURIComponent(val)}`);
            }} className="relative mb-4">
              <input 
                name="search"
                type="text" 
                placeholder="지역명 검색 (예: 강남구)" 
                className="w-full text-sm font-bold p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#3478B8] transition-colors"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3478B8] p-2 hover:bg-gray-100 rounded-lg">
                <Search size={18} />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2">
              <select onChange={(e) => { if(e.target.value !== 'default') navigate(`/exam-locations?query=${encodeURIComponent(e.target.value)}`) }} defaultValue="default" className="text-sm font-bold p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#3478B8] cursor-pointer">
                <option value="default" disabled hidden>주요 시/도</option>
                <option value="서울특별시">서울특별시</option>
                <option value="경기도">경기도</option>
                <option value="인천광역시">인천광역시</option>
                <option value="부산광역시">부산광역시</option>
                <option value="대구광역시">대구광역시</option>
                <option value="광주광역시">광주광역시</option>
                <option value="대전광역시">대전광역시</option>
              </select>
              <select onChange={(e) => { if(e.target.value !== 'default') navigate(`/exam-locations?query=${encodeURIComponent(e.target.value)}`) }} defaultValue="default" className="text-sm font-bold p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#3478B8] cursor-pointer">
                <option value="default" disabled hidden>주요 구</option>
                <option value="강남구">강남구</option>
                <option value="서초구">서초구</option>
                <option value="송파구">송파구</option>
                <option value="영등포구">영등포구</option>
                <option value="마포구">마포구</option>
                <option value="강서구">강서구</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CalendarPage
