import { memo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import NAV_ITEMS from '../navItems.js'
import useUnread from '../useUnread.js'

/**
 * Mobil va planshet uchun pastki tab menyu (desktopda <Sidebar> ishlatiladi).
 *
 * NIMA UCHUN BU YERDA framer-motion YO'Q.
 * Ilgari faol tab chizig'i `layoutId` bilan, ikonkalar esa `animate` bilan
 * harakatlanardi — ya'ni oltita animatsiya asosiy oqimda, JavaScript orqali
 * hisoblanardi. Yangi sahifa (masalan, suhbatlar ro'yxati) mount bo'layotgan
 * paytda React asosiy oqimni band qiladi va o'sha animatsiyalar to'xtab
 * qoladi — menyu "qotib qolgandek" ko'rinardi. Bundan tashqari `layoutId`
 * har bir o'tishda elementlarni o'lchaydi (getBoundingClientRect), bu esa
 * majburiy maket hisoblashiga olib keladi.
 *
 * Endi chiziq bitta element bo'lib, faqat CSS `transform` bilan suriladi.
 * Uni brauzer kompozitor qatlamida chizadi: JavaScript qanchalik band
 * bo'lishidan qat'i nazar, menyu hech qachon qotmaydi.
 */

/** NavLink bilan bir xil qoida: `end` bo'lsa aniq moslik, aks holda prefiks. */
function activeIndex(pathname) {
  return NAV_ITEMS.findIndex(({ to, end }) =>
    end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`),
  )
}

function BottomNav({ hidden = false }) {
  const t = useT()
  const { pathname } = useLocation()
  // Xabarlar endi faqat shu menyudan ochiladi — nishon shu yerda turadi.
  const { count: unread } = useUnread()

  const index = activeIndex(pathname)

  return (
    <nav
      className={`bn${hidden ? ' is-hidden' : ''}`}
      aria-label={t('app.name')}
      aria-hidden={hidden}
      style={{ '--bn-count': NAV_ITEMS.length, '--bn-active': Math.max(index, 0) }}
    >
      {/* Faol tab ustidagi ingichka chiziq — tabdan tabga siljiydi (CSS). */}
      <span className={`bn-ind${index < 0 ? ' is-hidden' : ''}`} aria-hidden="true" />

      {NAV_ITEMS.map(({ to, icon: Icon, key, end }) => {
        const isMessages = to === '/xabarlar'
        const badge = isMessages && unread > 0 ? (unread > 99 ? '99+' : unread) : null

        return (
          <NavLink key={to} to={to} end={end} className="bn-item">
            <span className="bn-icon">
              <Icon size={20} />
              {badge && <span className="bn-dot">{badge}</span>}
            </span>
            <span className="bn-label">{t(key)}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

/* <Layout> har marshrutda qayta render bo'ladi — menyu esa faqat manzil yoki
   o'qilmagan xabarlar soni o'zgargandagina. */
export default memo(BottomNav)
