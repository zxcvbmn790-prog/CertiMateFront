import RecommendationPage from '../pages/RecommendationPage';
import CoverLetterPage from '../pages/CoverLetterPage';
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
import GoogleCallbackPage from '../pages/GoogleCallbackPage'
import ExamLocationsPage from '../pages/ExamLocationsPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRouter() {
  const ZoomWrapper = ({ children }) => (
    <div style={{ zoom: 1.5 }}>
      {children}
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/study" element={<ZoomWrapper><StudyPage /></ZoomWrapper>} />
      <Route path="/exam-locations" element={<ZoomWrapper><ExamLocationsPage /></ZoomWrapper>} />
      <Route path="/calendar" element={<ZoomWrapper><CalendarPage /></ZoomWrapper>} />
      <Route path="/community" element={<ZoomWrapper><CommunityPage /></ZoomWrapper>} />
      <Route path="/profile" element={<ZoomWrapper><ProfilePage /></ZoomWrapper>} />
      <Route path="/login" element={<ZoomWrapper><LoginPage /></ZoomWrapper>} />
      <Route path="/register" element={<ZoomWrapper><RegisterPage /></ZoomWrapper>} />
      <Route path="/admin" element={<ZoomWrapper><AdminPage /></ZoomWrapper>} />
      <Route path="/find-password" element={<ZoomWrapper><FindPasswordPage /></ZoomWrapper>} />
      <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/recommend" element={<ZoomWrapper><RecommendationPage /></ZoomWrapper>} />
      <Route path="/cover-letter" element={<ZoomWrapper><CoverLetterPage /></ZoomWrapper>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
