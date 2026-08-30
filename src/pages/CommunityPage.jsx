import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, ChevronRight, Folder, Trophy, Image as ImageIcon, Eye, ThumbsUp, List, Check, X } from 'lucide-react'
import { communityApi } from '../api/communityApi'
import { authApi } from '../api/authApi'

const CommunityPage = () => {
  const navigate = useNavigate()

  // 1. BEST 인기글 및 공지사항 (고정 데이터)
  const bestPosts = [
    { id: '01', title: '면접에서 어학 없는 이유 물어보네요...', comments: 4 },
    { id: '02', title: '내 나이 29살, 공시 포기하고 취준할까요?', comments: 7 },
    { id: '03', title: '취준 마음가짐을 못 잡겠음', comments: 4 },
    { id: '04', title: '공대 전공을 못 살릴거 같아요', comments: 5 },
    { id: '05', title: '인턴 자격요건에 경력 1년.. ㅋㅋㅋ', comments: 5 },
  ]

  const notices = [
    { id: '01', title: '🏆 [6월 1주차] 취준생이 꼭 봐야할 정보 목록', icon: <Trophy className="text-yellow-500" size={16} /> },
    { id: '02', title: '🎉 오늘 서류 접수 시작! CertiMate 회원 혜택', icon: <Trophy className="text-blue-500" size={16} /> },
  ]

  // 상단 고정 공지 (하드코딩, DB 글과 id 충돌 방지 위해 큰 id 사용)
  const pinnedNotices = [
    { id: 90003, category: '공지사항', title: '📁 [필독] CertiMate 커뮤니티 이용 안내 & 취준 꿀팁', content: '커뮤니티 이용 규칙과 이번 주 합격 스펙·꿀팁을 정리했습니다.', writer: 'CertiMate', date: '2026.06.05', views: 262, recommendations: 12, scraps: 0, comments: 0, isNotice: true, icon: <Folder className="text-yellow-500" size={16} />, imageUrl: null, replyList: [] },
    { id: 90002, category: '공지사항', title: '🎉 CertiMate 회원 혜택 안내', content: 'CertiMate 회원을 위한 혜택을 안내합니다.', writer: 'CertiMate', date: '2026.06.04', views: 258, recommendations: 8, scraps: 0, comments: 0, isNotice: true, icon: <Trophy className="text-blue-500" size={16} />, imageUrl: null, replyList: [] },
  ]

  // 2. 전체 게시글 (백엔드 DB에서 로드)
  const [allPosts, setAllPosts] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)

  // DB 응답 → 프론트 게시글 형태 매핑
  const mapPost = (p) => ({
    id: p.id, category: p.category, title: p.title, content: p.content,
    writer: p.writer || (p.nickname ? `NV_${p.nickname}` : '익명'),
    date: p.date, views: p.views || 0, recommendations: p.recommendations || 0,
    scraps: 0, comments: p.comments || 0, isNotice: false,
    icon: p.imageUrl ? <ImageIcon className="text-[#007BFF]" size={16} /> : null,
    imageUrl: p.imageUrl || null, replyList: p.replyList || [],
  })

  const fetchPosts = async () => {
    try {
      const data = await communityApi.getPosts()
      setAllPosts(Array.isArray(data) ? data.map(mapPost) : [])
    } catch (err) {
      console.error('커뮤니티 목록 로드 실패:', err)
    }
  }

  useEffect(() => {
    fetchPosts()
    if (localStorage.getItem('isLoggedIn') === 'true') {
      authApi.getMe().then((res) => setCurrentUserId(res.data.id)).catch(() => {})
    }
  }, [])

  // 3. 상태 관리
  const [selectedPost, setSelectedPost] = useState(null) // 상세 화면 제어
  const [isWriting, setIsWriting] = useState(false) // 글쓰기 팝업 대신 '전체 페이지' 제어
  const [formData, setFormData] = useState({ title: '', category: '자유게시판', content: '' })
  const [commentInput, setCommentInput] = useState('')
  const [attachedImage, setAttachedImage] = useState(null) // 첨부 이미지 상태

  // 글쓰기 버튼 클릭 시 로그인 권한 검사 함수
  const handleWriteClick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.')
      navigate('/login')
    } else {
      setIsWriting(true)
    }
  }

  // 텍스트 및 라디오 버튼 입력값 변경 감지
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // 이미지 첨부 감지
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAttachedImage(file)
    }
  }

  // 게시물 작성(등록) 함수 — 백엔드에 실제 저장
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요!')
      return
    }
    try {
      const fd = new FormData()
      fd.append('title', formData.title)
      fd.append('category', formData.category)
      fd.append('content', formData.content)
      if (currentUserId) fd.append('userId', currentUserId)
      if (attachedImage) fd.append('image', attachedImage)

      await communityApi.createPost(fd)
      await fetchPosts() // DB에서 다시 불러와 새 글 반영

      setFormData({ title: '', category: '자유게시판', content: '' })
      setAttachedImage(null)
      setIsWriting(false)
    } catch (err) {
      console.error('글 등록 실패:', err)
      alert('글 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  // 게시글 클릭 시 상세 화면으로 이동
  const handlePostClick = async (post) => {
    // 브라우저 뒤로가기가 홈이 아니라 목록으로 돌아오도록 히스토리 항목 추가
    window.history.pushState({ communityDetail: true }, '')
    // 공지(하드코딩)는 DB에 없으므로 로컬로만 표시
    if (post.isNotice) { setSelectedPost(post); return }
    try {
      // 백엔드가 조회수를 +1 하고 DB에 저장한 뒤 최신 글을 반환 (조회수 유지)
      const data = await communityApi.getPost(post.id)
      const mapped = mapPost(data)
      setSelectedPost(mapped)
      setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: mapped.views } : p))
    } catch (err) {
      console.error('게시글 상세 조회 실패:', err)
      setSelectedPost(post)
    }
  }

  // 상세 화면에서 뒤로 가기 (인페이지 버튼 → 브라우저 back과 동일 경로)
  const handleGoBack = () => {
    window.history.back()
  }

  // 브라우저 뒤로가기 → 상세 닫고 목록으로
  useEffect(() => {
    const onPop = () => setSelectedPost(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 댓글 등록 함수
  const handleAddComment = () => {
    if (!commentInput.trim()) return
    const today = new Date()
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

    const newComment = { id: Date.now(), writer: 'NV_51630***', date: formattedDate, content: commentInput }
    const updatedPost = { ...selectedPost, comments: selectedPost.comments + 1, replyList: [...selectedPost.replyList, newComment] }
    const updatedPosts = allPosts.map(p => p.id === selectedPost.id ? updatedPost : p)

    setAllPosts(updatedPosts)
    setSelectedPost(updatedPost)
    setCommentInput('')
  }

  // ==========================================
  // [화면 1] 글쓰기 페이지 (isWriting이 true일 때 - 전체 화면)
  // ==========================================
  if (isWriting) {
    return (
      <main className="w-full max-w-5xl mx-auto px-6 py-10 bg-white font-sans text-gray-800 antialiased min-h-screen">
        <h2 className="text-2xl font-black text-slate-800 mb-8 pb-4 border-b-2 border-black flex items-center">
          <PenTool className="mr-3 text-[#007BFF]" size={24}/> 새 글 작성
        </h2>

        <form onSubmit={handleCreatePost} className="space-y-6 text-sm">
          {/* 별명 */}
          <div className="flex border-b border-gray-100 pb-5">
            <div className="w-32 font-bold text-slate-800 flex items-center pt-1">
              <span className="text-red-500 mr-1">*</span> 별명
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <span className="font-bold text-base">NV_51630***</span>
              <span className="border border-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded cursor-pointer hover:bg-gray-50">별명설정</span>
            </div>
          </div>

          {/* 분류 (라디오 버튼) */}
          <div className="flex border-b border-gray-100 pb-5">
            <div className="w-32 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 분류
            </div>
            <div className="flex-1 flex flex-wrap gap-5 items-center">
              {['자유게시판', '궁금해요', '취업·면접후기', '과외/스터디 모집'].map(cat => (
                <label key={cat} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={handleInputChange}
                    className="mr-2 cursor-pointer w-4 h-4 accent-[#007BFF]"
                  />
                  <span className={`group-hover:text-[#007BFF] transition ${formData.category === cat ? 'font-bold text-[#007BFF]' : 'text-gray-600'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="flex border-b border-gray-100 pb-5">
            <div className="w-32 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 제목
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-3 outline-none focus:border-[#007BFF] transition rounded-sm"
              />
            </div>
          </div>

          {/* 내용 */}
          <div className="flex border-b border-gray-100 pb-5">
            <div className="w-32 font-bold text-slate-800 pt-4">
              <span className="text-red-500 mr-1">*</span> 내용
            </div>
            <div className="flex-1 border border-black p-1 rounded-sm">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="18"
                className="w-full p-4 outline-none resize-none bg-transparent"
              ></textarea>
            </div>
          </div>

          {/* 사진 첨부 영역 */}
          <div className="flex border-b border-gray-100 pb-5">
            <div className="w-32 font-bold text-slate-800 flex items-center pt-2">사진 첨부</div>
            <div className="flex-1 flex items-center space-x-3">
              <label className="cursor-pointer flex items-center justify-center bg-white border border-gray-300 hover:border-[#007BFF] hover:text-[#007BFF] text-gray-600 px-4 py-2 rounded-sm transition font-bold text-sm">
                <ImageIcon size={16} className="mr-2" /> 컴퓨터에서 사진 찾기
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {attachedImage && (
                <span className="text-[#007BFF] font-medium text-sm flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#007BFF] mr-2"></span>
                  {attachedImage.name} (첨부 완료)
                </span>
              )}
            </div>
          </div>

          {/* 하단 등록 및 취소 버튼 */}
          <div className="flex justify-center space-x-3 pt-8 pb-10">
            <button type="submit" className="flex items-center px-8 py-3 bg-white text-[#007BFF] font-bold border border-[#007BFF] hover:bg-[#007BFF] hover:text-white transition rounded-sm">
              <Check size={18} className="mr-2" /> 등록하기
            </button>
            <button
              type="button"
              onClick={() => {
                setIsWriting(false)
                setAttachedImage(null)
                setFormData({ title: '', category: '자유게시판', content: '' })
              }}
              className="flex items-center px-8 py-3 bg-white text-gray-500 font-bold border border-gray-300 hover:bg-gray-50 transition rounded-sm"
            >
              <X size={18} className="mr-2" /> 취소
            </button>
          </div>
        </form>
      </main>
    )
  }

  // ==========================================
  // [화면 2] 게시글 상세 페이지 (선택된 글이 있을 때)
  // ==========================================
  if (selectedPost) {
    return (
      <main className="w-full max-w-5xl mx-auto px-6 py-10 bg-white font-sans text-gray-800 antialiased min-h-screen">
        <div className="mb-6">
          <h2 className="text-3xl font-black text-slate-800 mb-4">{selectedPost.title}</h2>
          <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-[#007BFF]">{selectedPost.writer}</span>
              <span className="text-gray-400">{selectedPost.date}</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <span className="flex items-center"><Eye size={16} className="mr-1" /> {selectedPost.views}</span>
              <span className="flex items-center"><ThumbsUp size={16} className="mr-1" /> {selectedPost.recommendations}</span>
            </div>
          </div>
        </div>

        <div className="min-h-[400px] text-slate-700 leading-relaxed whitespace-pre-wrap py-6 text-lg">
          {selectedPost.content}

          {selectedPost.imageUrl && (
            <div className="mt-8">
              <img
                src={selectedPost.imageUrl}
                alt="첨부 이미지"
                className="max-w-full rounded-xl border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-6 mb-10">
          <button onClick={handleGoBack} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            <List size={16} className="mr-2" /> 목록보기
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:text-[#007BFF] hover:border-[#007BFF] transition">
            <ThumbsUp size={16} className="mr-2" /> 좋아요
          </button>
        </div>

        <div className="mb-10">
          <div className="border border-gray-300 rounded-sm flex overflow-hidden">
            <div className="flex-1 p-4 bg-white">
              <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-800">NV_51630***</span>
                  <span className="border border-gray-200 text-gray-500 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-gray-50">별명설정</span>
                </div>
                <span className="text-xs text-gray-400">{commentInput.length} / 500</span>
              </div>
              <textarea
                value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                placeholder="- 사전 공지 없이 삭제될 수 있는 댓글&#13;&#10;잘못된 정보, 타인의 권리 침해, 욕설, 상업성 광고, 기타 부적절한 내용"
                className="w-full resize-none outline-none text-sm text-slate-500 min-h-[80px] pt-2" maxLength={500}
              />
            </div>
            <button onClick={handleAddComment} className="w-24 bg-white border-l border-gray-300 text-slate-600 font-bold hover:bg-gray-50 transition text-sm">
              등록
            </button>
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-100 pt-6">
          {selectedPost.replyList.map((reply) => (
            <div key={reply.id} className="border-b border-gray-100 pb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-800">{reply.writer}</span>
                  {reply.writer === selectedPost.writer && (
                    <span className="text-[10px] text-[#007BFF] border border-[#007BFF] px-1.5 rounded-full font-bold">작성자</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{reply.date}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
          {selectedPost.replyList.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              첫 번째 댓글을 남겨주세요!
            </div>
          )}
        </div>
      </main>
    )
  }

  // ==========================================
  // [화면 3] 게시글 목록 페이지 (기본 화면)
  // ==========================================
  return (
    <main className="w-full max-w-7xl mx-auto px-6 py-10 bg-white font-sans text-gray-800 antialiased flex flex-col relative min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">BEST 인기글</h2>
            <div className="flex space-x-2 text-sm text-gray-400">
              <span className="text-[#007BFF] font-bold">실시간</span>
              <span className="cursor-pointer hover:text-slate-800">주간</span>
              <span className="cursor-pointer hover:text-slate-800 flex items-center">더보기 <ChevronRight size={14}/></span>
            </div>
          </div>
          <div className="space-y-4">
            {bestPosts.map((post) => (
              <div key={post.id} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-black text-slate-900 w-6 text-center">{post.id}</span>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#007BFF] transition">{post.title}</p>
                </div>
                <span className="text-sm font-semibold text-[#DC3545]">({post.comments})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">CertiMate 공지</h2>
          </div>
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="flex items-center space-x-3 group cursor-pointer">
                <span className="text-lg font-black text-slate-900 w-6 text-center">{notice.id}</span>
                <div className="flex items-center space-x-1.5 flex-1 overflow-hidden">
                  {notice.icon}
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#007BFF] transition truncate">{notice.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800">전체글</h2>
        <button
          onClick={handleWriteClick}
          className="bg-[#007BFF] text-white px-8 py-3 rounded-xl font-semibold flex items-center shadow-lg hover:bg-[#0069D9] transition"
        >
          <PenTool size={18} className="mr-2" /> 글쓰기
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <table className="w-full text-center">
          <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">번호</th>
              <th className="px-6 py-4">게시판명</th>
              <th className="px-10 py-4 text-left">제목</th>
              <th className="px-6 py-4">글쓴이</th>
              <th className="px-6 py-4">등록일</th>
              <th className="px-6 py-4">조회</th>
              <th className="px-6 py-4">추천</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {[...pinnedNotices, ...allPosts].map((post) => (
              <tr
                key={post.id}
                onClick={() => handlePostClick(post)}
                className={`hover:bg-gray-50 transition cursor-pointer group ${post.isNotice ? 'bg-[#F8F9FA] text-[#007BFF] font-black' : 'font-semibold text-slate-800'}`}
              >
                <td className={`px-6 py-5 text-sm ${post.isNotice ? 'text-[#007BFF]' : 'text-gray-400'}`}>{post.isNotice ? '공지' : post.id}</td>
                <td className={`px-6 py-5 text-sm ${post.isNotice ? 'text-[#007BFF]' : 'text-gray-400'}`}>{post.category}</td>
                <td className="px-10 py-5 text-left">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    {post.icon}
                    <p className={`truncate ${post.isNotice ? 'text-[#007BFF]' : 'text-slate-800'}`}>{post.title}</p>
                    {post.comments > 0 && <span className="text-[#DC3545] font-semibold text-xs ml-1">({post.comments})</span>}
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-500">{post.writer}</td>
                <td className="px-6 py-5 text-gray-400">{post.date}</td>
                <td className="px-6 py-5 text-gray-400">{post.views}</td>
                <td className="px-6 py-5 text-gray-400">{post.recommendations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default CommunityPage
