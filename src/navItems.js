import { CartIcon, ChartIcon, GavelIcon, UserIcon } from './components/Icons.jsx'

/**
 * Pastki menyu va yon menyu bir xil ro'yxatdan quriladi — faqat ko'rinishi farq qiladi.
 * Xabarlar bu yerda yo'q: ular profil sahifasidagi ikonka orqali ochiladi.
 */
const NAV_ITEMS = [
  { to: '/', icon: GavelIcon, key: 'nav.auctions', end: true },
  { to: '/sorovlar', icon: CartIcon, key: 'nav.requests' },
  { to: '/statistika', icon: ChartIcon, key: 'nav.stats' },
  { to: '/profil', icon: UserIcon, key: 'nav.profile' },
]

export default NAV_ITEMS
