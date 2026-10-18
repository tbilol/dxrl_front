import {
  ClipboardIcon,
  MessageIcon,
  StoreIcon,
  UserIcon,
} from './components/Icons.jsx'

/**
 * Menyu manbai. Yon menyu guruhlangan ro'yxatni ko'rsatadi (desktop),
 * pastki menyu esa TO'RTTA asosiy bo'limni tekis ro'yxat sifatida oladi.
 *
 * Kalkulyator tab EMAS: u doskalar tepasidagi ikonkadan ochiladi.
 */
export const NAV_GROUPS = [
  {
    key: 'nav.groupMarket',
    items: [
      { to: '/', icon: StoreIcon, key: 'nav.offers', end: true },
      { to: '/sorovlar', icon: ClipboardIcon, key: 'nav.requests' },
    ],
  },
  {
    key: 'nav.groupAccount',
    items: [
      { to: '/xabarlar', icon: MessageIcon, key: 'nav.messages' },
      { to: '/profil', icon: UserIcon, key: 'nav.profile' },
    ],
  },
]

/** Pastki tab menyu — faqat to'rtta bo'lim. */
const NAV_ITEMS = [
  NAV_GROUPS[0].items[0],
  NAV_GROUPS[0].items[1],
  NAV_GROUPS[1].items[0],
  NAV_GROUPS[1].items[1],
]

export default NAV_ITEMS
