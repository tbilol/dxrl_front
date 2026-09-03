import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { LeafIcon, SettingsIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import NAV_ITEMS from '../navItems.js'
import useUnread from '../useUnread.js'

/** Desktop (>= 1024px) uchun chapdagi shishasimon yon menyu. */
export default function Sidebar() {
  const t = useT()
  const reduced = useReducedMotion()
  const { count } = useUnread()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-mark" aria-hidden="true">
          <LeafIcon size={22} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="name">{t('app.name')}</span>
          <span className="tag" style={{ display: 'block' }}>
            {t('app.tagline')}
          </span>
        </span>
      </div>

      <nav aria-label={t('app.name')} style={{ display: 'grid', gap: 4 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, key, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `side-item${isActive ? ' active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="side-pill"
                    className="side-pill"
                    transition={reduced ? { duration: 0 } : spring}
                  />
                )}

                <motion.span
                  className="side-icon"
                  animate={{ scale: isActive ? 1.06 : 1 }}
                  transition={reduced ? { duration: 0 } : spring}
                >
                  <Icon size={20} />
                </motion.span>

                <span className="side-label">{t(key)}</span>

                {badge && count > 0 ? (
                  <motion.span
                    className="side-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                    aria-label={`${count} ${t('nav.messages')}`}
                  >
                    {count > 99 ? '99+' : count}
                  </motion.span>
                ) : (
                  isActive && (
                    <motion.span
                      layoutId="side-dot"
                      className="side-dot"
                      transition={reduced ? { duration: 0 } : spring}
                      aria-hidden="true"
                    />
                  )
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavLink
          to="/sozlamalar"
          className={({ isActive }) => `side-item${isActive ? ' active' : ''}`}
        >
          <span className="side-icon">
            <SettingsIcon size={20} />
          </span>
          <span className="side-label">{t('settings.title')}</span>
        </NavLink>
      </div>
    </aside>
  )
}
