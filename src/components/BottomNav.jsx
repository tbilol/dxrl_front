import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import NAV_ITEMS from '../navItems.js'
import useUnread from '../useUnread.js'

/** Mobil va planshet uchun pastki tab menyu (desktopda <Sidebar> ishlatiladi). */
export default function BottomNav() {
  const t = useT()
  const reduced = useReducedMotion()
  const { count } = useUnread()

  return (
    <nav className="bottom-nav" aria-label={t('app.name')}>
      {NAV_ITEMS.map(({ to, icon: Icon, key, end, badge }) => (
        <NavLink key={to} to={to} end={end} className="nav-item">
          {({ isActive }) => (
            <>
              <span className="nav-icon-wrap">
                <motion.span
                  className="nav-icon"
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  transition={reduced ? { duration: 0 } : spring}
                  style={{ color: isActive ? 'var(--primary-strong)' : 'inherit' }}
                >
                  <Icon size={21} />
                </motion.span>

                {/* Zaytun nuqta — layoutId bilan tabdan tabga sakraydi. */}
                {isActive && (
                  <motion.span
                    layoutId="nav-dot"
                    className="nav-dot"
                    transition={reduced ? { duration: 0 } : spring}
                  />
                )}

                {badge && count > 0 && (
                  <motion.span
                    className="nav-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                    aria-label={`${count} ${t('nav.messages')}`}
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                )}
              </span>

              <span style={{ color: isActive ? 'var(--primary-strong)' : 'inherit' }}>
                {t(key)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
