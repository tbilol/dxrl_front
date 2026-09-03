import { useLocation } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import Sidebar from './Sidebar.jsx'
import { useIsDesktop } from '../useMediaQuery.js'

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

  return (
    <div className="shell">
      {isDesktop && <Sidebar />}

      <div className="shell-main">{children}</div>

      {!isDesktop && usesBottomNav(location.pathname) && <BottomNav />}
    </div>
  )
}
