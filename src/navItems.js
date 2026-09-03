import {
  CartIcon,
  ChartIcon,
  GavelIcon,
  MessageIcon,
  UserIcon,
} from './components/Icons.jsx'

/** Pastki menyu va yon menyu bir xil ro'yxatdan quriladi — faqat ko'rinishi farq qiladi. */
const NAV_ITEMS = [
  { to: '/', icon: GavelIcon, key: 'nav.auctions', end: true },
  { to: '/sorovlar', icon: CartIcon, key: 'nav.requests' },
  { to: '/xabarlar', icon: MessageIcon, key: 'nav.messages', badge: true },
  { to: '/statistika', icon: ChartIcon, key: 'nav.stats' },
  { to: '/profil', icon: UserIcon, key: 'nav.profile' },
]

export default NAV_ITEMS
