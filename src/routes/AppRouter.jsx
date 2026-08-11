import { Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import StudyPage from '../pages/StudyPage'
import CalendarPage from '../pages/CalendarPage'
import CommunityPage from '../pages/CommunityPage'
import ProfilePage from '../pages/ProfilePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AdminPage from '../pages/AdminPage'
import FindPasswordPage from '../pages/FindPasswordPage'
import KakaoCallbackPage from '../pages/KakaoCallbackPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/study" element={<StudyPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/find-password" element={<FindPasswordPage />} />
      <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
