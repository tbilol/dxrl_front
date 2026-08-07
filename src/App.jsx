import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import ListingListPage from './pages/ListingListPage.jsx'
import ListingFormPage from './pages/ListingFormPage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import ConversationsPage from './pages/ConversationsPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

/** Chat sahifasida pastki menyu o'rniga xabar kiritish paneli turadi. */
function usesBottomNav(pathname) {
  return !/^\/xabarlar\/[^/]+$/.test(pathname)
}

export default function App() {
  const location = useLocation()

  return (
    <div className="app">
      {/* mode="wait" — eski sahifa chiqib bo'lgach yangisi kiradi */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Auksionlar */}
          <Route path="/" element={<ListingListPage kind="auction" />} />
          <Route path="/auksion/yangi" element={<ListingFormPage kind="auction" />} />
          <Route path="/auksion/:id/tahrir" element={<ListingFormPage kind="auction" />} />
          <Route path="/auksion/:id" element={<ListingDetailPage kind="auction" />} />

          {/* So'rovlar */}
          <Route path="/sorovlar" element={<ListingListPage kind="request" />} />
          <Route path="/sorovlar/yangi" element={<ListingFormPage kind="request" />} />
          <Route path="/sorovlar/:id/tahrir" element={<ListingFormPage kind="request" />} />
          <Route path="/sorovlar/:id" element={<ListingDetailPage kind="request" />} />

          {/* Xabarlar */}
          <Route path="/xabarlar" element={<ConversationsPage />} />
          <Route path="/xabarlar/:conversationId" element={<ChatPage />} />

          {/* Qolganlari */}
          <Route path="/statistika" element={<StatsPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/sozlamalar" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {usesBottomNav(location.pathname) && <BottomNav />}
    </div>
  )
}
