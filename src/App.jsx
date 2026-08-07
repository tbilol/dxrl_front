import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import AuctionListPage from './pages/AuctionListPage.jsx'
import AuctionFormPage from './pages/AuctionFormPage.jsx'
import RequestListPage from './pages/RequestListPage.jsx'
import RequestFormPage from './pages/RequestFormPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<AuctionListPage />} />
        <Route path="/auksion/yangi" element={<AuctionFormPage />} />
        <Route path="/sorovlar" element={<RequestListPage />} />
        <Route path="/sorovlar/yangi" element={<RequestFormPage />} />
        <Route path="/statistika" element={<StatsPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
