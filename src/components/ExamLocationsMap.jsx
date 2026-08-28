import { useEffect, useRef } from 'react'

// 여러 시험장을 DB 좌표로 지도에 표시 (geocoding 불필요). selectedId가 있으면 그 마커로 중심 이동.
// 카카오맵 JS 키(VITE_KAKAO_JS_KEY)가 없으면 지도 대신 안내 문구를 보여준다.
const ExamLocationsMap = ({ locations, selectedId }) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const infoRef = useRef(null)

  const kakaoReady = typeof window !== 'undefined' && window.kakao && window.kakao.maps

  // 지도 1회 생성
  useEffect(() => {
    if (!kakaoReady || mapRef.current) return
    const { maps } = window.kakao
    mapRef.current = new maps.Map(mapContainer.current, {
      center: new maps.LatLng(37.566826, 126.9786567), // 서울시청 기본
      level: 8,
    })
    infoRef.current = new maps.InfoWindow({ zIndex: 1 })
  }, [kakaoReady])

  // locations 바뀌면 마커 다시 찍기
  useEffect(() => {
    if (!kakaoReady || !mapRef.current) return
    const { maps } = window.kakao
    const map = mapRef.current

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const valid = (locations || []).filter(l => l.latitude && l.longitude && !isNaN(+l.latitude) && !isNaN(+l.longitude))
    if (valid.length === 0) return

    const bounds = new maps.LatLngBounds()
    valid.forEach(loc => {
      const pos = new maps.LatLng(+loc.latitude, +loc.longitude)
      const marker = new maps.Marker({ map, position: pos })
      marker.locId = loc.id
      maps.event.addListener(marker, 'click', () => {
        infoRef.current.setContent(
          `<div style="padding:8px 10px;font-size:12px;font-weight:bold;max-width:220px;">${loc.testSite}</div>`
        )
        infoRef.current.open(map, marker)
        map.panTo(pos)
      })
      markersRef.current.push(marker)
      bounds.extend(pos)
    })
    map.setBounds(bounds)
  }, [locations, kakaoReady])

  // 목록에서 선택하면 해당 마커로 이동 + 인포윈도우
  useEffect(() => {
    if (!kakaoReady || !mapRef.current || !selectedId) return
    const { maps } = window.kakao
    const marker = markersRef.current.find(m => m.locId === selectedId)
    const loc = (locations || []).find(l => l.id === selectedId)
    if (!marker || !loc) return
    const pos = new maps.LatLng(+loc.latitude, +loc.longitude)
    infoRef.current.setContent(
      `<div style="padding:8px 10px;font-size:12px;font-weight:bold;max-width:220px;">${loc.testSite}</div>`
    )
    infoRef.current.open(mapRef.current, marker)
    mapRef.current.setLevel(4)
    mapRef.current.panTo(pos)
  }, [selectedId, kakaoReady, locations])

  if (!kakaoReady) {
    return (
      <div className="w-full h-[420px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-center px-6">
        <p className="text-sm text-gray-400 font-medium">
          🗺️ 지도를 보려면 카카오맵 키가 필요합니다.<br />
          <span className="text-xs">(VITE_KAKAO_JS_KEY 설정 시 표시됩니다. 목록/검색은 지금도 사용 가능)</span>
        </p>
      </div>
    )
  }

  return <div ref={mapContainer} className="w-full h-[420px] rounded-2xl border border-gray-200 shadow-sm" />
}

export default ExamLocationsMap
