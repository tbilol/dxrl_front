import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { CartIcon, ChartIcon, GavelIcon, MessageIcon, UserIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import useUnread from '../useUnread.js'

const TABS = [
  { to: '/', icon: GavelIcon, key: 'nav.auctions', end: true },
  { to: '/sorovlar', icon: CartIcon, key: 'nav.requests' },
  { to: '/xabarlar', icon: MessageIcon, key: 'nav.messages', badge: true },
  { to: '/statistika', icon: ChartIcon, key: 'nav.stats' },
  { to: '/profil', icon: UserIcon, key: 'nav.profile' },
]

export default function BottomNav() {
  const t = useT()
  const reduced = useReducedMotion()
  const { count } = useUnread()

  return (
    <nav className="bottom-nav" aria-label={t('app.name')}>
      {TABS.map(({ to, icon: Icon, key, end, badge }) => (
        <NavLink key={to} to={to} end={end} className="nav-item">
          {({ isActive }) => (
            <>
              <span className={`nav-icon-wrap${isActive ? ' is-active' : ''}`}>
                {/* layoutId — faol indikator tabdan tabga silliq siljiydi */}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="nav-pill"
                    transition={reduced ? { duration: 0 } : spring}
                  />
                )}
                <motion.span
                  className="nav-icon"
                  animate={{ scale: isActive ? 1.08 : 1, y: isActive ? -1 : 0 }}
                  transition={spring}
                  style={{ color: isActive ? 'var(--primary)' : 'inherit', display: 'grid' }}
                >
                  <Icon size={21} />
                </motion.span>

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

              <span style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>{t(key)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
