import { NavLink } from 'react-router-dom'
import { CartIcon, ChartIcon, GavelIcon, UserIcon } from './Icons.jsx'

const TABS = [
  { to: '/', label: 'Auksion', Icon: GavelIcon, end: true },
  { to: '/sorovlar', label: "So'rovlar", Icon: CartIcon },
  { to: '/statistika', label: 'Statistika', Icon: ChartIcon },
  { to: '/profil', label: 'Profil', Icon: UserIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">
            <Icon size={20} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
