import { useState } from 'react'
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react'
import { examApi } from '../api/examApi'
import ExamLocationsMap from '../components/ExamLocationsMap'

const ExamLocationsPage = () => {
  const [query, setQuery] = useState('')
  const [locations, setLocations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(null) // 'search' | 'near'
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(''); setSelectedId(null)
    try {
      const res = await examApi.searchLocations(query.trim())
      setLocations(res.data)
      setMode('search')
    } catch {
      setError('검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNearby = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 기능을 지원하지 않습니다.')
      return
    }
    setLoading(true); setError(''); setSelectedId(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await examApi.nearbyLocations(pos.coords.latitude, pos.coords.longitude, 15)
          setLocations(res.data)
          setMode('near')
        } catch {
          setError('내 주변 시험장 조회에 실패했습니다.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('위치 권한이 거부되었습니다. 브라우저에서 위치 접근을 허용해 주세요.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="min-h-screen bg-[#EAECEF] font-sans text-[#4A4F58] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center">
            <MapPin className="mr-2 text-[#3478B8]" size={30} /> 시험장 찾기
          </h1>
          <p className="text-gray-400 font-medium">가까운 시험장을 찾거나 지역·이름으로 검색하세요.</p>
        </div>

        {/* 검색 + 내 주변 */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="지역이나 시험장 이름 검색 (예: 강남, 공단, 대학교)"
              className="w-full p-4 pl-12 rounded-2xl border border-gray-200 outline-none focus:border-[#3478B8] font-medium bg-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          </form>
          <button
            onClick={handleSearch}
            className="px-6 py-4 rounded-2xl bg-[#3478B8] text-white font-black hover:bg-[#2e69a3] transition"
          >
            검색
          </button>
          <button
            onClick={handleNearby}
            className="px-6 py-4 rounded-2xl bg-[#3BAA7D] text-white font-black hover:bg-[#31926b] transition flex items-center justify-center"
          >
            <Navigation size={18} className="mr-2" /> 내 주변 찾기
          </button>
        </div>

        {error && <div className="mb-4 p-4 rounded-2xl bg-[#E61E2B]/5 border border-[#E61E2B]/20 text-[#E61E2B] text-sm font-bold">{error}</div>}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 지도 */}
          <ExamLocationsMap locations={locations} selectedId={selectedId} />

          {/* 목록 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} /> 불러오는 중...
              </div>
            ) : locations.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-300 text-sm font-medium text-center px-4">
                {mode ? '결과가 없습니다.' : '검색하거나 "내 주변 찾기"를 눌러보세요.'}
              </div>
            ) : (
              <>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                  {mode === 'near' ? '내 주변 가까운 순' : '검색 결과'} · {locations.length}곳
                </div>
                <div className="space-y-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedId(loc.id)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        selectedId === loc.id ? 'border-[#3478B8] bg-[#3478B8]/5' : 'border-gray-100 hover:border-[#3478B8]/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[15px] leading-snug">{loc.testSite}</span>
                        {loc.distanceKm != null && (
                          <span className="shrink-0 text-[11px] font-black text-[#3BAA7D] bg-[#3BAA7D]/10 px-2 py-1 rounded-full">
                            {loc.distanceKm}km
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{loc.address}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamLocationsPage
