import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해 주세요!')
      return
    }
    alert(`"${searchKeyword}" 자격증을 검색합니다! (기능 준비중)`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden bg-slate-900">
      {/* 배경 이미지 영역 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* 메인 콘텐츠 영역 (타이틀 및 검색창) */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-20 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl animate-fade-in-up text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight tracking-tight mb-6">
            내일을 바꾸는<br />당신의 첫걸음
          </h1>
          <p className="text-blue-200 text-lg md:text-xl mb-10 font-medium">
            맞춤형 자격증 추천부터 기출문제 학습까지,<br />모든 것을 한 곳에서 해결하세요 CertiMate
          </p>

          {/* 검색창 컨테이너 */}
          <div className="bg-white rounded-full flex items-center px-6 py-4 mb-8 w-full max-w-xl shadow-2xl">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="관심있는 자격증을 검색해보세요"
              className="flex-1 outline-none text-slate-800 text-lg bg-transparent"
            />
            <button
              onClick={handleSearch}
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <CategoryPill text="정보처리기사" active={true} onClick={() => setSearchKeyword('정보처리기사')} />
            <CategoryPill text="한국사능력검정" onClick={() => setSearchKeyword('한국사능력검정')} />
            <CategoryPill text="IT/컴퓨터" onClick={() => setSearchKeyword('IT/컴퓨터')} />
            <CategoryPill text="외국어" onClick={() => setSearchKeyword('외국어')} />
          </div>
        </div>
      </div>

      {/* 하단 퀵 메뉴 영역 */}
      <div className="relative z-10 w-full border-t border-white/20 bg-black/40 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-20 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BottomMenuBox title="CBT 모의고사" link="/study" />
            <BottomMenuBox title="시험 일정 달력" link="/calendar" />
            <BottomMenuBox title="합격 후기 게시판" link="/community" />
            <BottomMenuBox title="내 학습 진도" link="/profile" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* --- 하위 UI 컴포넌트들 --- */

const CategoryPill = ({ text, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-600'
        : 'bg-black/30 text-white border border-white/40 hover:bg-white/20'
    }`}
  >
    {text}
  </button>
)

// 버튼을 클릭할 때마다 로그인 여부를 검사하는 문지기 로직
const BottomMenuBox = ({ title, link }) => {
  const navigate = useNavigate()

  const handleClick = (e) => {
    e.preventDefault()
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.')
      navigate('/login')
    } else {
      navigate(link) // 로그인된 사람만 통과!
    }
  }

  return (
    <button
      onClick={handleClick}
      className="group flex w-full items-center justify-center h-14 px-4 rounded-lg border border-white/20 bg-white/5 hover:bg-white text-white hover:text-slate-900 transition-all duration-300"
    >
      <span className="font-semibold text-sm md:text-base tracking-wide text-center break-keep">
        {title}
      </span>
    </button>
  )
}

export default HomePage
