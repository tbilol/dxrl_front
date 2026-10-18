import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RouteFallback from './components/RouteFallback.jsx'

/*
 * Har bir sahifa alohida bo'lakda (React.lazy). Ikki foyda:
 *   · birinchi yuklashda faqat ochilgan sahifa kodi olinadi va tahlil qilinadi;
 *   · og'ir kutubxonalar (masalan, statistikadagi diagrammalar) boshqa
 *     sahifalarning asosiy oqimini band qilmaydi.
 *
 * Bo'laklar navigatsiyani kutib turmasligi uchun ular birinchi chizishdan
 * keyin, brauzer bo'sh turganda oldindan yuklanadi (usePrefetchRoutes) —
 * shuning uchun <RouteFallback> amalda ko'rinmaydi.
 */
const ListingListPage = lazy(() => import('./pages/ListingListPage.jsx'))
const ListingFormPage = lazy(() => import('./pages/ListingFormPage.jsx'))
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage.jsx'))
const ConversationsPage = lazy(() => import('./pages/ConversationsPage.jsx'))
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'))
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'))
const StatsDetailPage = lazy(() => import('./pages/StatsDetailPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const FollowListPage = lazy(() => import('./pages/FollowListPage.jsx'))
const PhoneAuthPage = lazy(() => import('./pages/PhoneAuthPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const SettingsSubPage = lazy(() => import('./pages/SettingsSubPage.jsx'))
const PremiumPage = lazy(() => import('./pages/PremiumPage.jsx'))
const VerifyFarmerPage = lazy(() => import('./pages/VerifyFarmerPage.jsx'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage.jsx'))
const TransactionsPage = lazy(() => import('./pages/TransactionsPage.jsx'))
const TransactionPage = lazy(() => import('./pages/TransactionPage.jsx'))

/** Eng ko'p ishlatiladigan sahifalar birinchi bo'lib olinadi. */
const PREFETCH = [
  () => import('./pages/ListingListPage.jsx'),
  () => import('./pages/ListingDetailPage.jsx'),
  () => import('./pages/ProfilePage.jsx'),
  () => import('./pages/ConversationsPage.jsx'),
  () => import('./pages/ChatPage.jsx'),
  () => import('./pages/ListingFormPage.jsx'),
  () => import('./pages/SettingsPage.jsx'),
  () => import('./pages/StatsPage.jsx'),
  () => import('./pages/StatsDetailPage.jsx'),
  () => import('./pages/SettingsSubPage.jsx'),
  () => import('./pages/FollowListPage.jsx'),
  () => import('./pages/PhoneAuthPage.jsx'),
  () => import('./pages/PremiumPage.jsx'),
  () => import('./pages/VerifyFarmerPage.jsx'),
  () => import('./pages/CalculatorPage.jsx'),
  () => import('./pages/TransactionsPage.jsx'),
  () => import('./pages/TransactionPage.jsx'),
]

/** Bo'laklarni birma-bir, faqat brauzer bo'sh turganda yuklaydi. */
function usePrefetchRoutes() {
  useEffect(() => {
    let stopped = false
    let handle = null

    const idle =
      window.requestIdleCallback ||
      ((cb) => window.setTimeout(() => cb({ timeRemaining: () => 32 }), 200))
    const cancel = window.cancelIdleCallback || window.clearTimeout

    let i = 0
    const step = () => {
      if (stopped || i >= PREFETCH.length) return
      // Xato bo'lsa jim o'tamiz: bu faqat oldindan yuklash, sahifa baribir ochiladi.
      PREFETCH[i++]().catch(() => {})
      handle = idle(step)
    }
    handle = idle(step)

    return () => {
      stopped = true
      if (handle !== null) cancel(handle)
    }
  }, [])
}

export default function App() {
  usePrefetchRoutes()

  return (
    <Layout>
      {/*
        Marshrutlar <AnimatePresence> ichida EMAS.
        Ilgari `mode="wait"` ishlatilardi: yangi sahifa eskisining chiqish
        animatsiyasi tugaguncha umuman mount bo'lmasdi — har bir o'tishda
        ~215ms qotib turish va bo'sh ekran shundan edi. Endi yangi sahifa
        darhol mount bo'ladi va o'zi yumshoq paydo bo'ladi (PageShell).
      */}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Takliflar */}
          <Route path="/" element={<ListingListPage kind="offer" />} />
          <Route path="/takliflar/yangi" element={<ListingFormPage kind="offer" />} />
          <Route path="/takliflar/:id/tahrir" element={<ListingFormPage kind="offer" />} />
          <Route path="/takliflar/:id" element={<ListingDetailPage kind="offer" />} />

          {/* So'rovlar */}
          <Route path="/sorovlar" element={<ListingListPage kind="request" />} />
          <Route path="/sorovlar/yangi" element={<ListingFormPage kind="request" />} />
          <Route path="/sorovlar/:id/tahrir" element={<ListingFormPage kind="request" />} />
          <Route path="/sorovlar/:id" element={<ListingDetailPage kind="request" />} />

          {/* Xabarlar */}
          <Route path="/xabarlar" element={<ConversationsPage />} />
          <Route path="/xabarlar/:conversationId" element={<ChatPage />} />

          {/* Profil: o'ziniki va boshqa foydalanuvchilarniki */}
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route
            path="/profile/:userId/kuzatuvchilar"
            element={<FollowListPage mode="followers" />}
          />
          <Route
            path="/profile/:userId/kuzatilganlar"
            element={<FollowListPage mode="following" />}
          />

          {/* Statistika — tab EMAS: doskalar tepasidagi paneldan ochiladi. */}
          <Route path="/statistika" element={<Navigate to="/statistika/dehqon" replace />} />
          <Route path="/statistika/dehqon" element={<StatsPage scope="farmer" />} />
          <Route path="/statistika/sotuvchi" element={<StatsPage scope="reseller" />} />
          {/* Bo'limning to'liq ro'yxati (top-200) — alohida to'liq ekranli sahifa. */}
          <Route path="/statistika/batafsil/:type" element={<StatsDetailPage />} />
          {/* Bitim (eskrov) oqimi */}
          <Route path="/tranzaksiyalar" element={<TransactionsPage />} />
          <Route path="/tranzaksiya/:id" element={<TransactionPage />} />

          {/* Tarif, dehqon tasdig'i va super kalkulyator */}
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/tasdiqlash" element={<VerifyFarmerPage />} />
          <Route path="/kalkulyator" element={<CalculatorPage />} />

          <Route path="/kirish" element={<PhoneAuthPage />} />
          <Route path="/sozlamalar" element={<SettingsPage />} />
          <Route path="/sozlamalar/profil" element={<SettingsSubPage section="profil" />} />
          <Route path="/sozlamalar/telefon" element={<SettingsSubPage section="telefon" />} />
          <Route path="/sozlamalar/parol" element={<SettingsSubPage section="parol" />} />
          <Route
            path="/sozlamalar/akkauntlar"
            element={<SettingsSubPage section="akkauntlar" />}
          />
          <Route path="/sozlamalar/shartlar" element={<SettingsSubPage section="shartlar" />} />
          <Route path="/sozlamalar/maxfiylik" element={<SettingsSubPage section="maxfiylik" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
