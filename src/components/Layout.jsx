import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import Sidebar from './Sidebar.jsx'
import { useIsDesktop } from '../useMediaQuery.js'
import log from '../logger.js'

/** Chat sahifasida pastki menyu o'rniga xabar kiritish paneli turadi. */
function usesBottomNav(pathname) {
  return !/^\/xabarlar\/[^/]+$/.test(pathname)
}

/**
 * Moslashuvchan karkas: desktopda chapda yon menyu, kichik ekranlarda pastki tab menyu.
 * Ikkalasi ham bitta NAV_ITEMS ro'yxatidan quriladi.
 */
export default function Layout({ children }) {
  const location = useLocation()
  const isDesktop = useIsDesktop()
  const prevPath = useRef(null)

  // Har bir marshrut o'zgarishi konsolga yoziladi.
  useEffect(() => {
    const to = location.pathname
    if (prevPath.current !== to) {
      log.nav('Marshrut o\'zgardi', { from: prevPath.current ?? '(boshlanish)', to })
      prevPath.current = to
    }
  }, [location.pathname])

  // Ekran o'lchamiga qarab menyu turi almashadi.
  useEffect(() => {
    log.front('Menyu rejimi', isDesktop ? 'sidebar (desktop)' : 'bottom nav (mobil)')
  }, [isDesktop])

  return (
    <div className="shell">
      {isDesktop && <Sidebar />}

      <div className="shell-main">{children}</div>

      {!isDesktop && usesBottomNav(location.pathname) && <BottomNav />}
    </div>
  )
}
