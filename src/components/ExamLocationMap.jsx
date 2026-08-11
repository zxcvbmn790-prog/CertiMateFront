import { useEffect, useRef } from 'react'

const ExamLocationMap = ({ address, centerName }) => {
  const mapContainer = useRef(null)

  useEffect(() => {
    // 카카오 지도 스크립트가 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오 지도 API가 로드되지 않았습니다.')
      return
    }

    const { maps } = window.kakao

    // 1. 기본 지도를 서울 중심으로 임시 생성
    const mapOption = {
      center: new maps.LatLng(37.566826, 126.9786567), // 서울시청 주소
      level: 3, // 확대 레벨 (1~14, 숫자가 작을수록 확대)
    }
    const map = new maps.Map(mapContainer.current, mapOption)

    // 2. 주소-좌표 변환 객체(Geocoder) 생성
    const geocoder = new maps.services.Geocoder()

    // 3. props로 전달받은 주소로 좌표 검색
    if (address) {
      geocoder.addressSearch(address, (result, status) => {
        // 정상적으로 검색이 완료됐으면
        if (status === maps.services.Status.OK) {
          const coords = new maps.LatLng(result[0].y, result[0].x)

          // 결과값으로 받은 위치에 마커 생성
          const marker = new maps.Marker({
            map: map,
            position: coords,
          })

          // 마커 위에 표시할 인포윈도우(고사장명) 생성
          const infowindow = new maps.InfoWindow({
            content: `
              <div style="width:200px; text-align:center; padding:8px 0; font-size:14px; font-weight:bold; color:#333; border-radius:4px;">
                ${centerName}
              </div>
            `,
          })
          infowindow.open(map, marker)

          // 지도의 중심을 결과로 받은 좌표로 이동
          map.setCenter(coords)
        } else {
          console.error('주소 검색 실패: ', address)
        }
      })
    }
  }, [address, centerName]) // 주소나 고사장명이 바뀌면 지도를 새로 그림

  return (
    <div className="w-full my-4">
      <p className="text-sm font-semibold text-gray-600 mb-2">📍 고사장 위치 안내</p>
      {/* 지도가 그려질 영역 (Tailwind CSS 적용) */}
      <div
        ref={mapContainer}
        className="w-full h-[350px] rounded-xl border border-gray-200 shadow-sm"
      />
    </div>
  )
}

export default ExamLocationMap
