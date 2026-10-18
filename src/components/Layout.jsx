import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'
import Sidebar from './Sidebar.jsx'
import { useIsDesktop } from '../useMediaQuery.js'
import { SCROLLER_ID, scrollToTop } from '../scroller.js'
import log from '../logger.js'

/**
 * To'liq ekranli ichki sahifalar — pastki menyu pastga siljib yashirinadi:
 * ochiq suhbat (`position: fixed` qoplama, o'ngdan suriladi).
 */
function isFullscreen(pathname) {
  return /^\/xabarlar\/[^/]+$/.test(pathname)
}

/**
 * Moslashuvchan karkas: desktopda chapda yon menyu, kichik ekranlarda pastki tab menyu.
 * Ikkalasi ham bitta NAV_ITEMS ro'yxatidan quriladi.
 *
 * <Sidebar> va <BottomNav> React.memo bilan o'ralgan (o'z fayllarida): bu
 * komponent har marshrut o'zgarishida qayta render bo'ladi (useLocation),
 * lekin menyular o'zgarmaydi — faol tabni NavLink o'zi marshrut
 * kontekstidan oladi.
 */
export default function Layout({ children }) {
  const location = useLocation()
  const navigationType = useNavigationType()
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

  /*
   * Yangi sahifa doim tepasidan boshlanadi. "Orqaga" (POP) bosilganda esa
   * brauzerning o'z siljish tiklashiga tegmaymiz.
   * useLayoutEffect — chizishdan oldin, shunda sahifa avval o'rtasida
   * ko'rinib, keyin tepaga sakramaydi.
   */
  useLayoutEffect(() => {
    if (navigationType === 'POP') return
    scrollToTop()
  }, [location.pathname, navigationType])

  return (
    <div className="shell">
      {isDesktop && <Sidebar />}

      {/* Sahifa aynan shu element ichida siljiydi — hujjatning o'zi emas
          (izohi scroller.js da). */}
      <div className="shell-main" id={SCROLLER_ID}>
        {children}
      </div>

      {/*
        Menyu OLIB TASHLANMAYDI — u joyida qoladi va faqat pastga siljiydi.
        Shunda ochilish/yopilishda silliq animatsiya bo'ladi va maket
        qayta hisoblanmaydi (faqat `transform`).
      */}
      {!isDesktop && <BottomNav hidden={isFullscreen(location.pathname)} />}
    </div>
  )
}
