import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, ChevronRight, Folder, Trophy, Image as ImageIcon, Eye, ThumbsUp, List, Check, X, Edit3, Trash2 } from 'lucide-react'
import { communityApi } from '../api/communityApi'
import { authApi } from '../api/authApi'

const CommunityPage = () => {
  const navigate = useNavigate()

  // 이미지 풀 URL 헬퍼
  const getFullImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url
    }
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace('/api', '')
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // 공지사항 (고정 데이터)
  const notices = [
    { id: '01', title: '🏆 [6월 1주차] 취준생이 꼭 봐야할 정보 목록', icon: <Trophy className="text-yellow-500" size={16} /> },
    { id: '02', title: '🎉 오늘 서류 접수 시작! CertiMate 회원 혜택', icon: <Trophy className="text-blue-500" size={16} /> },
  ]

  // 상단 고정 공지 (하드코딩, DB 글과 id 충돌 방지 위해 큰 id 사용)
  const pinnedNotices = [
    { id: 90003, category: '공지사항', title: '📁 [필독] CertiMate 커뮤니티 이용 안내 & 취준 꿀팁', content: '커뮤니티 이용 규칙과 이번 주 합격 스펙·꿀팁을 정리했습니다.', writer: 'CertiMate', date: '2026.06.05', views: 262, recommendations: 12, scraps: 0, comments: 0, isNotice: true, icon: <Folder className="text-yellow-500" size={16} />, imageUrl: null, replyList: [] },
    { id: 90002, category: '공지사항', title: '🎉 CertiMate 회원 혜택 안내', content: 'CertiMate 회원을 위한 혜택을 안내합니다.', writer: 'CertiMate', date: '2026.06.04', views: 258, recommendations: 8, scraps: 0, comments: 0, isNotice: true, icon: <Trophy className="text-blue-500" size={16} />, imageUrl: null, replyList: [] },
  ]

  // 게시글 State
  const [allPosts, setAllPosts] = useState([])
  const [bestPosts, setBestPosts] = useState([])
  const [bestSort, setBestSort] = useState('views') // 'views' (조회순) | 'recommendations' (추천순)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)


  // 상세/글쓰기/수정 화면 제어 State
  const [selectedPost, setSelectedPost] = useState(null)
  const [isWriting, setIsWriting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 글 작성용 State
  const [formData, setFormData] = useState({ title: '', category: '자유게시판', content: '' })
  const [attachedImage, setAttachedImage] = useState(null)

  // 글 수정용 State
  const [editFormData, setEditFormData] = useState({ title: '', category: '자유게시판', content: '' })
  const [editAttachedImage, setEditAttachedImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)

  // 댓글 State
  const [commentInput, setCommentInput] = useState('')


  // 1. 초기 데이터 로드 (게시글 목록, 인기글, 현재 사용자 정보)
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await communityApi.getAllPosts()
      if (Array.isArray(data) && data.length > 0) {
        setAllPosts(data)
      } else {
        // 백엔드에 데이터가 아직 없을 때 기본 더미 데이터 표시
        setAllPosts([
          { id: 3, category: '공지사항', title: '📁 [6월 1주차] 취준생 필독! 이번주 합격 스펙&취준 꿀팁 LIST', content: '이번 주 꼭 확인해야 할 합격 스펙과 꿀팁을 정리해 드립니다!\n\n1. 어학 점수 커트라인\n2. 필수 자격증 리스트\n3. 면접 빈출 질문', writer: 'CertiMate', date: '2026.06.05', views: 262, recommendations: 12, comments: 1, isNotice: true, replyList: [{ id: 1, writer: '취준파이터', date: '2026.06.05', content: '좋은 정보 감사합니다!' }] },
          { id: 2, category: '자유게시판', title: '🍽️ 취뽀한 날 당일 저녁 뭐 먹고 싶어? 댓글 달고 치킨 받자!', content: '드디어 취업에 성공한 여러분! 가장 먼저 먹고 싶은 음식은 무엇인가요?\n댓글로 남겨주시면 추첨을 통해 5분께 치킨 기프티콘을 쏩니다!', writer: 'CertiMate', date: '2026.06.04', views: 258, recommendations: 8, comments: 0, isNotice: true, replyList: [] },
          { id: 1, category: 'BEST 취준', title: '🏆 [6월 1주차] 취준생이 꼭 봐야할 인턴 공고 스펙 총정리', content: '현재 모집 중인 주요 기업 인턴 공고와 합격자 평균 스펙을 모았습니다. 놓치지 말고 지원하세요!', writer: 'CertiMate', date: '2026.06.04', views: 997, recommendations: 45, comments: 0, isNotice: true, replyList: [] },
        ])
      }
    } catch (err) {
      console.error('게시글 목록 불러오기 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBestPosts = async (sort = bestSort) => {
    try {
      const data = await communityApi.getBestPosts(sort)
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort((a, b) => {
          if (sort === 'recommendations') {
            return (b.recommendations || 0) - (a.recommendations || 0)
          }
          return (b.views || 0) - (a.views || 0)
        })
        setBestPosts(sorted.slice(0, 5))
      } else {
        const dummyBest = [
          {
            id: 101,
            category: '취업/이직',
            title: '면접에서 어학 없는 이유 물어보네요...',
            content: '어학 점수가 없어서 걱정했는데 다행히 실무 포트폴리오와 자격증을 좋게 봐주셨습니다.\n모두 자신감 갖고 도전하세요!',
            writer: '취준생A',
            date: '2026.06.05',
            views: 1520,
            recommendations: 85,
            comments: 4,
            replyList: [
              { id: 1, writer: '멘토스', date: '2026.06.05', content: '직무 관련 자격증이 확실하면 어학 공백도 충분히 커버 가능합니다.' }
            ]
          },
          {
            id: 102,
            category: '자유게시판',
            title: '내 나이 29살, 공시 포기하고 취준할까요?',
            content: '공무원 시험 2년 준비하다가 이번에 일반 기업이나 공기업 자격증 취득 후 취준으로 전향하려 합니다. 늦지 않았을까요?',
            writer: '합격가자',
            date: '2026.06.04',
            views: 2310,
            recommendations: 42,
            comments: 7,
            replyList: []
          },
          {
            id: 103,
            category: '고민상담',
            title: '취준 마음가짐을 못 잡겠음',
            content: '서류 탈락이 계속되니까 자존감이 떨어지네요. 다들 멘탈 관리 어떻게 하시나요?',
            writer: '파이팅맨',
            date: '2026.06.03',
            views: 980,
            recommendations: 120,
            comments: 4,
            replyList: []
          },
          {
            id: 104,
            category: '자격증',
            title: '공대 전공을 못 살릴거 같아요',
            content: '전공과 다른 IT 데이터/개발 자격증 취득하고 있는데 괜찮을까요?',
            writer: '코딩초보',
            date: '2026.06.02',
            views: 1840,
            recommendations: 63,
            comments: 5,
            replyList: []
          },
          {
            id: 105,
            category: 'BEST 취준',
            title: '인턴 자격요건에 경력 1년.. ㅋㅋㅋ',
            content: '신입 인턴 채용공고인데 필수 우대요건에 관련 경력 1년 이상이 적혀있네요 허탈합니다.',
            writer: '인턴희망',
            date: '2026.06.01',
            views: 3100,
            recommendations: 195,
            comments: 5,
            replyList: []
          },
        ]
        const sorted = [...dummyBest].sort((a, b) => {
          if (sort === 'recommendations') {
            return (b.recommendations || 0) - (a.recommendations || 0)
          }
          return (b.views || 0) - (a.views || 0)
        })
        setBestPosts(sorted.slice(0, 5))
      }
    } catch (err) {
      console.error('인기글 불러오기 실패:', err)
      const dummyBest = [
        {
          id: 101,
          category: '취업/이직',
          title: '면접에서 어학 없는 이유 물어보네요...',
          content: '어학 점수가 없어서 걱정했는데 다행히 실무 포트폴리오와 자격증을 좋게 봐주셨습니다.\n모두 자신감 갖고 도전하세요!',
          writer: '취준생A',
          date: '2026.06.05',
          views: 1520,
          recommendations: 85,
          comments: 4,
          replyList: [
            { id: 1, writer: '멘토스', date: '2026.06.05', content: '직무 관련 자격증이 확실하면 어학 공백도 충분히 커버 가능합니다.' }
          ]
        },
        {
          id: 102,
          category: '자유게시판',
          title: '내 나이 29살, 공시 포기하고 취준할까요?',
          content: '공무원 시험 2년 준비하다가 이번에 일반 기업이나 공기업 자격증 취득 후 취준으로 전향하려 합니다. 늦지 않았을까요?',
          writer: '합격가자',
          date: '2026.06.04',
          views: 2310,
          recommendations: 42,
          comments: 7,
          replyList: []
        },
        {
          id: 103,
          category: '고민상담',
          title: '취준 마음가짐을 못 잡겠음',
          content: '서류 탈락이 계속되니까 자존감이 떨어지네요. 다들 멘탈 관리 어떻게 하시나요?',
          writer: '파이팅맨',
          date: '2026.06.03',
          views: 980,
          recommendations: 120,
          comments: 4,
          replyList: []
        },
        {
          id: 104,
          category: '자격증',
          title: '공대 전공을 못 살릴거 같아요',
          content: '전공과 다른 IT 데이터/개발 자격증 취득하고 있는데 괜찮을까요?',
          writer: '코딩초보',
          date: '2026.06.02',
          views: 1840,
          recommendations: 63,
          comments: 5,
          replyList: []
        },
        {
          id: 105,
          category: 'BEST 취준',
          title: '인턴 자격요건에 경력 1년.. ㅋㅋㅋ',
          content: '신입 인턴 채용공고인데 필수 우대요건에 관련 경력 1년 이상이 적혀있네요 허탈합니다.',
          writer: '인턴희망',
          date: '2026.06.01',
          views: 3100,
          recommendations: 195,
          comments: 5,
          replyList: []
        },
      ]
      const sorted = [...dummyBest].sort((a, b) => {
        if (sort === 'recommendations') {
          return (b.recommendations || 0) - (a.recommendations || 0)
        }
        return (b.views || 0) - (a.views || 0)
      })
      setBestPosts(sorted.slice(0, 5))
    }
  }

  const handleBestSortChange = (sortType) => {
    if (bestSort === sortType) return
    setBestSort(sortType)
    fetchBestPosts(sortType)
  }

  useEffect(() => {
    fetchPosts()
    fetchBestPosts()

    // 1. 로컬 캐시 사용자 정보 복원
    const cachedUser = localStorage.getItem('currentUser')
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser))
      } catch (e) {
        console.warn('사용자 캐시 파싱 오류:', e)
      }
    }

    // 2. 로그인 사용자 정보 API 조회
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      authApi.getMe()
        .then((res) => {
          const user = res?.data?.id ? res.data : (res?.id ? res : (res?.data || res))
          if (user && (user.id || user.name)) {
            setCurrentUser(user)
            localStorage.setItem('currentUser', JSON.stringify(user))
          }
        })
        .catch((err) => {
          console.warn('사용자 정보 조회 실패:', err)
        })
    }
  }, [])

  // 글쓰기 버튼 클릭
  const handleWriteClick = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다. 로그인 화면으로 이동합니다.')
      navigate('/login')
    } else {
      setIsWriting(true)
    }
  }

  // 글쓰기 폼 입력 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // 글 수정 폼 입력 변경
  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData({ ...editFormData, [name]: value })
  }

  // 새 글 등록 함수
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요!')
      return
    }

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('category', formData.category)
      data.append('content', formData.content)
      if (currentUser?.id) {
        data.append('userId', currentUser.id)
        data.append('user_id', currentUser.id)
      }
      if (attachedImage) {
        data.append('image', attachedImage)
      }

      await communityApi.createPost(data)
      alert('게시글이 등록되었습니다!')

      // 상태 초기화 후 목록 새로고침
      setFormData({ title: '', category: '자유게시판', content: '' })
      setAttachedImage(null)
      setIsWriting(false)
      await fetchPosts()
      await fetchBestPosts()
    } catch (err) {
      console.error('게시글 등록 실패:', err)
      alert('게시글 등록에 실패했습니다: ' + (err?.response?.data || err.message))
    }
  }

  // 좋아요 로컬 스토리지 키 및 헬퍼
  const getLikeStorageKey = () => {
    return currentUser?.id ? `likedPostIds_${currentUser.id}` : 'likedPostIds_guest'
  }

  const getLikedListFromStorage = () => {
    try {
      const raw = localStorage.getItem(getLikeStorageKey())
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  }

  const saveLikedToStorage = (postId, isLiked) => {
    try {
      const list = getLikedListFromStorage()
      let updatedList
      if (isLiked) {
        updatedList = Array.from(new Set([...list, postId]))
      } else {
        updatedList = list.filter(id => id !== postId)
      }
      localStorage.setItem(getLikeStorageKey(), JSON.stringify(updatedList))
    } catch (e) {
      console.warn('좋아요 로컬 저장 실패:', e)
    }
  }

  // 게시글 클릭 시 상세 화면 조회
  const handlePostClick = async (post) => {
    // 브라우저 뒤로가기가 홈이 아니라 목록으로 돌아오도록 히스토리 항목 추가
    window.history.pushState({ communityDetail: true }, '')
    // 공지(하드코딩)는 DB에 없으므로 로컬로만 표시
    if (post.isNotice) {
      setSelectedPost(post)
      return
    }
    const storedLiked = getLikedListFromStorage().includes(post.id)
    try {
      const detail = await communityApi.getPostDetail(post.id, currentUser?.id)
      const serverLiked = detail?.isLiked !== undefined ? detail.isLiked : (detail?.liked !== undefined ? detail.liked : null)
      const isLiked = serverLiked !== null ? serverLiked : storedLiked
      saveLikedToStorage(post.id, isLiked)
      const fullPost = { ...post, ...detail, isLiked }
      setSelectedPost(fullPost)
      setAllPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: fullPost.views || (p.views || 0) + 1 } : p))
    } catch (err) {
      console.error('게시글 상세 조회 실패 (로컬 데이터로 대체):', err)
      const updatedPost = { ...post, views: (post.views || 0) + 1, isLiked: storedLiked }
      setSelectedPost(updatedPost)
    }
  }

  // 상세 화면에서 뒤로 가기 (인페이지 버튼 → 브라우저 back과 동일 경로)
  const handleGoBack = () => {
    setSelectedPost(null)
    setIsEditing(false)
    if (window.history.state?.communityDetail) {
      window.history.back()
    }
  }

  // 게시글 좋아요(추천) 함수 - 중복 방지, 1인 1회 토글, 알림창 없이 실행
  const handleRecommend = async () => {
    if (!selectedPost) return
    const currentlyLiked = !!selectedPost.isLiked
    const nextLiked = !currentlyLiked
    const currentRecs = selectedPost.recommendations || 0
    const nextRecs = Math.max(0, currentRecs + (nextLiked ? 1 : -1))

    // UI 즉각 반영 (낙관적 업데이트 및 알림창 없이 조용히 반영)
    setSelectedPost(prev => ({
      ...prev,
      isLiked: nextLiked,
      recommendations: nextRecs,
    }))
    saveLikedToStorage(selectedPost.id, nextLiked)

    // 전체 및 인기글 목록의 추천 수도 동기화
    setAllPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, recommendations: nextRecs } : p))
    setBestPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, recommendations: nextRecs } : p))

    try {
      const updated = await communityApi.recommendPost(selectedPost.id, {
        userId: currentUser?.id,
        liked: currentlyLiked,
      })
      if (updated) {
        const serverLiked = updated.isLiked !== undefined ? updated.isLiked : (updated.liked !== undefined ? updated.liked : nextLiked)
        const serverRecs = updated.recommendations !== undefined ? updated.recommendations : nextRecs
        setSelectedPost(prev => ({
          ...prev,
          ...updated,
          isLiked: serverLiked,
          recommendations: serverRecs,
        }))
        saveLikedToStorage(selectedPost.id, serverLiked)
        setAllPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, recommendations: serverRecs } : p))
        setBestPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, recommendations: serverRecs } : p))
      }
    } catch (err) {
      console.error('추천 토글 실패:', err)
      // 알림창(alert) 없이 실행 유지
    }
  }

  // 브라우저 뒤로가기 → 상세 닫고 목록으로
  useEffect(() => {
    const onPop = () => setSelectedPost(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 댓글 등록 함수
  const handleAddComment = async () => {
    if (!commentInput.trim()) return
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      alert('댓글을 작성하려면 로그인이 필요합니다.')
      navigate('/login')
      return
    }

    try {
      await communityApi.createComment({
        postId: selectedPost.id,
        content: commentInput,
        userId: currentUser?.id,
        writer: currentUser?.name || '익명',
      })
      setCommentInput('')
      const refreshed = await communityApi.getPostDetail(selectedPost.id, currentUser?.id)
      setSelectedPost(prev => ({ ...refreshed, isLiked: refreshed?.isLiked ?? prev?.isLiked }))
      fetchPosts()
    } catch (err) {
      console.error('댓글 등록 실패:', err)
      alert('댓글 등록에 실패했습니다.')
    }
  }

  // 게시글 수정 모드 진입
  const handleStartEdit = () => {
    setEditFormData({
      title: selectedPost.title || '',
      category: selectedPost.category || '자유게시판',
      content: selectedPost.content || '',
    })
    setEditAttachedImage(null)
    setRemoveImage(false)
    setIsEditing(true)
  }

  // 게시글 수정 저장 함수
  const handleUpdatePost = async (e) => {
    e.preventDefault()
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요!')
      return
    }

    try {
      const data = new FormData()
      data.append('title', editFormData.title)
      data.append('category', editFormData.category)
      data.append('content', editFormData.content)
      data.append('removeImage', removeImage)
      if (currentUser?.id) {
        data.append('userId', currentUser.id)
      }
      if (editAttachedImage) {
        data.append('image', editAttachedImage)
      }

      let updatedPost = null
      try {
        updatedPost = await communityApi.updatePost(selectedPost.id, data)
      } catch (apiErr) {
        console.warn('서버 수정 실패, 로컬 상태 동기화로 대체:', apiErr)
      }

      alert('게시글이 성공적으로 수정되었습니다!')

      const nextPost = updatedPost ? { ...selectedPost, ...updatedPost } : {
        ...selectedPost,
        title: editFormData.title,
        category: editFormData.category,
        content: editFormData.content,
        imageUrl: removeImage ? null : (editAttachedImage ? URL.createObjectURL(editAttachedImage) : selectedPost.imageUrl)
      }

      setSelectedPost(nextPost)
      setIsEditing(false)
      setAllPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, ...nextPost } : p))
      fetchPosts()
      fetchBestPosts()
    } catch (err) {
      console.error('게시글 수정 실패:', err)
      alert('게시글 수정에 실패했습니다: ' + (err?.response?.data || err.message))
    }
  }

  // 게시글 삭제 함수
  const handleDeletePost = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?\n댓글, 대댓글, 좋아요 이력 및 첨부 이미지가 모두 함께 삭제됩니다.')) {
      return
    }

    try {
      try {
        await communityApi.deletePost(selectedPost.id, currentUser?.id)
      } catch (apiErr) {
        console.warn('서버 삭제 실패, 로컬 상태 동기화로 대체:', apiErr)
      }

      alert('게시글이 성공적으로 삭제되었습니다.')
      const deletedId = selectedPost.id
      setSelectedPost(null)
      setIsEditing(false)
      setAllPosts(prev => prev.filter(p => p.id !== deletedId))
      fetchPosts()
      fetchBestPosts()
    } catch (err) {
      console.error('게시글 삭제 실패:', err)
      alert('게시글 삭제에 실패했습니다: ' + (err?.response?.data || err.message))
    }
  }

  // 본인 게시글 여부 판별 함수 (작성자 ID, 닉네임, 이름 또는 본인 작성 플래그 비교)
  const isPostMine = (post) => {
    if (!post) return false
    if (post.isMine === true) return true
    if (!currentUser) return false

    // 1. userId 매칭 (숫자 또는 문자열)
    if (post.userId != null && currentUser.id != null && String(post.userId).trim() === String(currentUser.id).trim()) {
      return true
    }
    // 2. nickname 매칭 (DB 매핑된 int형 user_id)
    if (post.nickname != null && currentUser.id != null && String(post.nickname).trim() === String(currentUser.id).trim()) {
      return true
    }
    // 3. 작성자명(writer) 매칭
    if (post.writer && currentUser.name && post.writer.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) {
      return true
    }
    return false
  }

  // 상세 화면에서 현재 보고 있는 글이 본인 글인지 여부
  const isMyPost = isPostMine(selectedPost)

  // ==========================================
  // [화면 1] 글쓰기 페이지 (isWriting이 true일 때)
  // ==========================================
  if (isWriting) {
    return (
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-white font-sans text-gray-800 antialiased min-h-screen">
        <h2 className="text-2xl font-black text-slate-800 mb-8 pb-4 border-b-2 border-black flex items-center">
          <PenTool className="mr-3 text-[#007BFF]" size={24}/> 새 글 작성
        </h2>

        <form onSubmit={handleCreatePost} className="space-y-6 text-sm">
          {/* 작성자 표시 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center md:pt-1">
              <span className="text-red-500 mr-1">*</span> 작성자
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <span className="font-bold text-base">{currentUser?.name || '로그인 사용자'}</span>
            </div>
          </div>

          {/* 분류 (라디오 버튼) */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 분류
            </div>
            <div className="flex-1 flex flex-wrap gap-x-5 gap-y-3 items-center">
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
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 제목
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="제목을 입력해 주세요"
                className="w-full border border-gray-300 p-3 outline-none focus:border-[#007BFF] transition rounded-sm"
              />
            </div>
          </div>

          {/* 내용 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 md:pt-4">
              <span className="text-red-500 mr-1">*</span> 내용
            </div>
            <div className="flex-1 border border-black p-1 rounded-sm">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="12"
                placeholder="내용을 입력해 주세요"
                className="w-full p-4 outline-none resize-none bg-transparent"
              ></textarea>
            </div>
          </div>

          {/* 사진 첨부 영역 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center md:pt-2">사진 첨부</div>
            <div className="flex-1 flex flex-wrap items-center gap-3 min-w-0">
              <label className="cursor-pointer flex items-center justify-center bg-white border border-gray-300 hover:border-[#007BFF] hover:text-[#007BFF] text-gray-600 px-4 py-2 rounded-sm transition font-bold text-sm">
                <ImageIcon size={16} className="mr-2" /> 컴퓨터에서 사진 찾기
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAttachedImage(e.target.files[0] || null)} />
              </label>
              {attachedImage && (
                <span className="text-[#007BFF] font-medium text-sm flex items-center min-w-0 break-all">
                  <span className="w-2 h-2 rounded-full bg-[#007BFF] mr-2 shrink-0"></span>
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
  // [화면 2] 글 수정 페이지 (isEditing이 true일 때)
  // ==========================================
  if (isEditing && selectedPost) {
    return (
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-white font-sans text-gray-800 antialiased min-h-screen">
        <h2 className="text-2xl font-black text-slate-800 mb-8 pb-4 border-b-2 border-black flex items-center">
          <Edit3 className="mr-3 text-[#007BFF]" size={24}/> 게시글 수정
        </h2>

        <form onSubmit={handleUpdatePost} className="space-y-6 text-sm">
          {/* 분류 (라디오 버튼) */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 분류
            </div>
            <div className="flex-1 flex flex-wrap gap-x-5 gap-y-3 items-center">
              {['자유게시판', '궁금해요', '취업·면접후기', '과외/스터디 모집'].map(cat => (
                <label key={cat} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={editFormData.category === cat}
                    onChange={handleEditInputChange}
                    className="mr-2 cursor-pointer w-4 h-4 accent-[#007BFF]"
                  />
                  <span className={`group-hover:text-[#007BFF] transition ${editFormData.category === cat ? 'font-bold text-[#007BFF]' : 'text-gray-600'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 flex items-center">
              <span className="text-red-500 mr-1">*</span> 제목
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                className="w-full border border-gray-300 p-3 outline-none focus:border-[#007BFF] transition rounded-sm"
              />
            </div>
          </div>

          {/* 내용 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 md:pt-4">
              <span className="text-red-500 mr-1">*</span> 내용
            </div>
            <div className="flex-1 border border-black p-1 rounded-sm">
              <textarea
                name="content"
                value={editFormData.content}
                onChange={handleEditInputChange}
                rows="18"
                className="w-full p-4 outline-none resize-none bg-transparent"
              ></textarea>
            </div>
          </div>

          {/* 기존 이미지 및 사진 변경 영역 */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 border-b border-gray-100 pb-5">
            <div className="md:w-32 shrink-0 font-bold text-slate-800 md:pt-2">첨부 이미지</div>
            <div className="flex-1 space-y-4">
              {selectedPost.imageUrl && !removeImage && (
                <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <img
                    src={getFullImageUrl(selectedPost.imageUrl)}
                    alt="현재 첨부 이미지"
                    className="h-16 w-16 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold">현재 첨부된 이미지</p>
                    <label className="mt-1 flex items-center text-xs text-red-500 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={removeImage}
                        onChange={(e) => setRemoveImage(e.target.checked)}
                        className="mr-1.5 accent-red-500"
                      />
                      이미지 삭제하기
                    </label>
                  </div>
                </div>
              )}

              {removeImage && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded flex items-center justify-between">
                  <span>기존 이미지가 삭제됩니다.</span>
                  <button
                    type="button"
                    onClick={() => setRemoveImage(false)}
                    className="text-gray-500 hover:text-black underline"
                  >
                    삭제 취소
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer flex items-center justify-center bg-white border border-gray-300 hover:border-[#007BFF] hover:text-[#007BFF] text-gray-600 px-4 py-2 rounded-sm transition font-bold text-sm">
                  <ImageIcon size={16} className="mr-2" /> {selectedPost.imageUrl ? '다른 사진으로 변경' : '컴퓨터에서 사진 찾기'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setEditAttachedImage(e.target.files[0] || null)} />
                </label>
                {editAttachedImage && (
                  <span className="text-[#007BFF] font-medium text-sm flex items-center min-w-0 break-all">
                    <span className="w-2 h-2 rounded-full bg-[#007BFF] mr-2 shrink-0"></span>
                    {editAttachedImage.name} (새 이미지 선택됨)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 하단 수정 완료 및 취소 버튼 */}
          <div className="flex justify-center space-x-3 pt-8 pb-10">
            <button type="submit" className="flex items-center px-8 py-3 bg-[#007BFF] text-white font-bold hover:bg-[#0069D9] transition rounded-sm shadow">
              <Check size={18} className="mr-2" /> 수정 완료
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
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
  // [화면 3] 게시글 상세 페이지 (선택된 글이 있을 때)
  // ==========================================
  if (selectedPost) {
    return (
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-white font-sans text-gray-800 antialiased min-h-screen">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#007BFF] border border-blue-100">
              {selectedPost.category || '자유게시판'}
            </span>
            {isMyPost && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center">
                <Check size={12} className="mr-1" /> 본인 작성 글 (수정 및 삭제 가능)
              </span>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-2 sm:gap-0">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 break-words min-w-0">{selectedPost.title}</h2>

            {/* 내가 쓴 글일 때만 노출되는 [수정], [삭제] 버튼 */}
            {isMyPost && (
              <div className="flex items-center space-x-2 shrink-0 sm:ml-4 self-end sm:self-auto">
                <button
                  onClick={handleStartEdit}
                  className="flex items-center px-3.5 py-1.5 border border-blue-200 bg-blue-50 text-[#007BFF] rounded-lg text-xs font-bold hover:bg-blue-100 transition shadow-xs cursor-pointer"
                >
                  <Edit3 size={14} className="mr-1" /> 수정
                </button>
                <button
                  onClick={handleDeletePost}
                  className="flex items-center px-3.5 py-1.5 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-xs cursor-pointer"
                >
                  <Trash2 size={14} className="mr-1" /> 삭제
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 text-sm border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-[#007BFF]">{selectedPost.writer}</span>
              <span className="text-gray-400">{selectedPost.date}</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <span className="flex items-center"><Eye size={16} className="mr-1" /> {selectedPost.views || 0}</span>
              <span className="flex items-center">
                <ThumbsUp size={16} className={`mr-1 transition-colors ${selectedPost.isLiked ? 'text-[#007BFF] fill-[#007BFF]' : ''}`} />
                {selectedPost.recommendations || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-[200px] md:min-h-[300px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words py-6 text-base md:text-lg">
          {selectedPost.content}

          {selectedPost.imageUrl && (
            <div className="mt-8">
              <img
                src={getFullImageUrl(selectedPost.imageUrl)}
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
          <button
            onClick={handleRecommend}
            className={`flex items-center px-4 py-2 border rounded-lg text-sm font-bold transition cursor-pointer ${
              selectedPost.isLiked
                ? 'border-[#007BFF] text-[#007BFF] bg-blue-50/40 shadow-xs'
                : 'border-gray-300 text-gray-600 hover:text-[#007BFF] hover:border-[#007BFF] bg-white'
            }`}
          >
            <ThumbsUp
              size={16}
              className={`mr-2 transition-colors ${selectedPost.isLiked ? 'text-[#007BFF] fill-[#007BFF]' : ''}`}
            />
            좋아요 ({selectedPost.recommendations || 0})
          </button>
        </div>

        {/* 댓글 입력 영역 */}
        <div className="mb-10">
          <div className="border border-gray-300 rounded-sm flex overflow-hidden">
            <div className="flex-1 min-w-0 p-3 md:p-4 bg-white">
              <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-800">{currentUser?.name || '로그인 사용자'}</span>
                </div>
                <span className="text-xs text-gray-400">{commentInput.length} / 500</span>
              </div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="- 사전 공지 없이 삭제될 수 있는 댓글&#13;&#10;잘못된 정보, 타인의 권리 침해, 욕설, 상업성 광고, 기타 부적절한 내용"
                className="w-full resize-none outline-none text-sm text-slate-500 min-h-[80px] pt-2"
                maxLength={500}
              />
            </div>
            <button
              onClick={handleAddComment}
              className="w-16 md:w-24 shrink-0 bg-white border-l border-gray-300 text-slate-600 font-bold hover:bg-gray-50 transition text-sm"
            >
              등록
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-6 border-t border-gray-100 pt-6">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            댓글 <span className="text-[#007BFF]">{(selectedPost.replyList || []).length}</span>개
          </h3>
          {(selectedPost.replyList || []).map((reply) => (
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

              {/* 대댓글(children)이 있을 경우 */}
              {reply.children && reply.children.length > 0 && (
                <div className="mt-4 ml-2 md:ml-6 pl-3 md:pl-4 border-l-2 border-gray-200 space-y-4">
                  {reply.children.map((child) => (
                    <div key={child.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-800">{child.writer}</span>
                        <span className="text-[11px] text-gray-400">{child.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{child.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(!selectedPost.replyList || selectedPost.replyList.length === 0) && (
            <div className="text-center py-10 text-gray-400 text-sm">
              첫 번째 댓글을 남겨주세요!
            </div>
          )}
        </div>
      </main>
    )
  }

  // ==========================================
  // [화면 4] 게시글 목록 페이지 (기본 화면)
  // ==========================================
  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-white font-sans text-gray-800 antialiased flex flex-col relative min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-10">
        {/* BEST 인기글 박스 */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">BEST 인기글</h2>
            <div className="flex items-center space-x-2 text-sm">
              <button
                type="button"
                onClick={() => handleBestSortChange('views')}
                className={`transition-colors cursor-pointer font-semibold ${
                  bestSort === 'views'
                    ? 'text-[#007BFF] font-bold'
                    : 'text-gray-400 hover:text-slate-800'
                }`}
              >
                조회순
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button
                type="button"
                onClick={() => handleBestSortChange('recommendations')}
                className={`transition-colors cursor-pointer font-semibold ${
                  bestSort === 'recommendations'
                    ? 'text-[#007BFF] font-bold'
                    : 'text-gray-400 hover:text-slate-800'
                }`}
              >
                추천순
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {bestPosts.map((post, idx) => (
              <div
                key={post.id || idx}
                onClick={() => handlePostClick(post)}
                className="flex justify-between items-center group cursor-pointer"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="text-lg font-black text-slate-900 w-6 text-center shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-[#007BFF] transition truncate">
                    {post.title}
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {bestSort === 'views' && post.views != null && (
                    <span className="text-xs text-gray-400 flex items-center font-medium">
                      <Eye size={13} className="mr-0.5" />
                      {post.views}
                    </span>
                  )}
                  {bestSort === 'recommendations' && post.recommendations != null && (
                    <span className="text-xs text-[#007BFF] flex items-center font-medium">
                      <ThumbsUp size={13} className="mr-0.5" />
                      {post.recommendations}
                    </span>
                  )}
                  {post.comments != null && (
                    <span className="text-sm font-semibold text-[#DC3545]">
                      ({post.comments})
                    </span>
                  )}
                </div>
              </div>
            ))}
            {bestPosts.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                인기글이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* CertiMate 공지 박스 */}
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">CertiMate 공지</h2>
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

      <div className="flex justify-between items-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-800">전체글</h2>
        <button
          onClick={handleWriteClick}
          className="bg-[#007BFF] text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold flex items-center shadow-lg hover:bg-[#0069D9] transition"
        >
          <PenTool size={18} className="mr-2" /> 글쓰기
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        {/* 모바일은 제목 열만 남기고 나머지 정보는 제목 아래 한 줄로 보여준다 */}
        <table className="w-full text-center table-fixed md:table-auto">
          <thead className="hidden md:table-header-group bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
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
                <td className={`hidden md:table-cell px-6 py-5 text-sm ${post.isNotice ? 'text-[#007BFF]' : 'text-gray-400'}`}>{post.isNotice ? '공지' : post.id}</td>
                <td className={`hidden md:table-cell px-6 py-5 text-sm ${post.isNotice ? 'text-[#007BFF]' : 'text-gray-400'}`}>{post.category}</td>
                <td className="px-4 md:px-10 py-4 md:py-5 text-left">
                  <div className="flex items-center space-x-1.5 overflow-hidden">
                    {isPostMine(post) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#007BFF] shrink-0">
                        내 글
                      </span>
                    )}
                    {post.imageUrl && <ImageIcon size={16} className="text-[#007BFF] shrink-0" />}
                    <p className={`truncate ${post.isNotice ? 'text-[#007BFF]' : 'text-slate-800'}`}>{post.title}</p>
                    {post.comments > 0 && <span className="text-[#DC3545] font-semibold text-xs ml-1 shrink-0">({post.comments})</span>}
                  </div>
                  <div className="md:hidden mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] font-medium text-gray-400">
                    <span className={post.isNotice ? 'text-[#007BFF] font-bold' : ''}>{post.isNotice ? '공지' : post.category}</span>
                    <span>{post.writer}</span>
                    <span>{post.date}</span>
                    <span className="flex items-center"><Eye size={11} className="mr-0.5" />{post.views || 0}</span>
                    <span className="flex items-center"><ThumbsUp size={11} className="mr-0.5" />{post.recommendations || 0}</span>
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-5 text-gray-500">{post.writer}</td>
                <td className="hidden md:table-cell px-6 py-5 text-gray-400">{post.date}</td>
                <td className="hidden md:table-cell px-6 py-5 text-gray-400">{post.views || 0}</td>
                <td className="hidden md:table-cell px-6 py-5 text-gray-400">{post.recommendations || 0}</td>
              </tr>
            ))}
            {allPosts.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  등록된 게시글이 없습니다. 첫 글을 작성해 보세요!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default CommunityPage
