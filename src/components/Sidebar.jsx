import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { LeafIcon, SettingsIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import { NAV_GROUPS } from '../navItems.js'

/**
 * Desktop (>= 1024px) uchun chapdagi yon menyu.
 * Tuzilishi: brend → guruhlangan bo'limlar → pastda sozlamalar.
 *
 * Bu yerda "yangi e'lon" tugmasi yo'q: uni ro'yxat sahifalaridagi yagona
 * suzuvchi "+" tugmasi (<Fab>) bajaradi — bitta ekranda ikkita bir xil
 * amal tugmasi turmasligi uchun.
 */
function Sidebar() {
  const t = useT()
  const reduced = useReducedMotion()

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sb-brand">
        {/* Logotip: barg shakli o'zgarmagan, faqat yangi ramka va rang. */}
        <span className="sb-mark" aria-hidden="true">
          <LeafIcon size={16} />
        </span>
        <span className="sb-word">
          <span className="sb-name">{t('app.name')}</span>
          <span className="sb-tag">{t('app.tagline')}</span>
        </span>
      </NavLink>

      <nav className="sb-nav" aria-label={t('app.name')}>
        {NAV_GROUPS.map((group) => (
          <div className="sb-group" key={group.key}>
            <span className="sb-group-label">{t(group.key)}</span>

            {group.items.map(({ to, icon: Icon, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sb-active"
                        className="sb-active"
                        transition={reduced ? { duration: 0 } : spring}
                      />
                    )}
                    <span className="sb-icon">
                      <Icon size={16} />
                    </span>
                    <span className="sb-label">{t(key)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <NavLink
          to="/sozlamalar"
          className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
        >
          <span className="sb-icon">
            <SettingsIcon size={16} />
          </span>
          <span className="sb-label">{t('settings.title')}</span>
        </NavLink>
      </div>
    </aside>
  )
}

/* Marshrut o'zgarganda qayta render bo'lishi shart emas: faol bo'limni
   NavLink o'zi router kontekstidan oladi. */
export default memo(Sidebar)
