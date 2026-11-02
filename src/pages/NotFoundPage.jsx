import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#EAECEF] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-5xl font-black text-[#3478B8]">404</p>
        <h1 className="mt-4 text-xl font-black text-[#4A4F58]">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-gray-400 font-medium break-keep">주소가 바뀌었거나 삭제된 페이지일 수 있어요.</p>
        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 bg-[#3478B8] text-white rounded-2xl font-black text-sm hover:bg-[#2e69a3] transition-colors"
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
