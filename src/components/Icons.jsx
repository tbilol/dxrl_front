/* Bir xil uslubdagi chiziqli SVG ikonkalar (Lucide uslubi, stroke 2px).
   Emoji ikonka sifatida ishlatilmaydi — barchasi vektor. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ size = 22, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      {children}
    </svg>
  )
}

/* Bozor rastasi — dehqon takliflari bo'limi. */
export const StoreIcon = (p) => (
  <Svg {...p}>
    <path d="M3 9.5 4.6 4.6A1 1 0 0 1 5.55 4h12.9a1 1 0 0 1 .95.6L21 9.5" />
    <path d="M3 9.5h18v1a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
    <path d="M5 13.4V20h14v-6.6" />
    <path d="M9.5 20v-4.2h5V20" />
  </Svg>
)

/* So'rovlar — xaridor ro'yxati. */
export const ClipboardIcon = (p) => (
  <Svg {...p}>
    <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1z" />
    <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    <path d="M8.5 12h7" />
    <path d="M8.5 16h4.5" />
  </Svg>
)

/* Bargli belgi — mahsulot yorlig'i uchun kichik ikonka. */
export const SproutIcon = (p) => (
  <Svg {...p}>
    <path d="M7 20h10" />
    <path d="M12 20v-8" />
    <path d="M12 12C12 8.7 9.5 6 6 6c0 3.3 2.5 6 6 6z" />
    <path d="M12 12c0-3 2.2-5.5 5.5-5.5C17.5 9.5 15 12 12 12z" />
  </Svg>
)

export const CartIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </Svg>
)

export const UserIcon = (p) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
)

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
)

export const MapPinIcon = (p) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
)

export const PlusIcon = (p) => (
  <Svg {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
)

export const MinusIcon = (p) => (
  <Svg {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
)

export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Svg>
)

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Svg>
)

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
)

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
)

export const EditIcon = (p) => (
  <Svg {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
)

export const TrashIcon = (p) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
)

export const InboxIcon = (p) => (
  <Svg {...p}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Svg>
)

export const TagIcon = (p) => (
  <Svg {...p}>
    <path d="M20.59 13.41 12 22l-9-9V3h10l7.59 7.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Svg>
)

export const LogOutIcon = (p) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
)

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </Svg>
)

export const MessageIcon = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
)

export const SendIcon = (p) => (
  <Svg {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Svg>
)

export const SettingsIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
)

export const XIcon = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
)

export const AlertIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
)

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
  </Svg>
)

export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
)

export const MonitorIcon = (p) => (
  <Svg {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </Svg>
)

export const GlobeIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
)

export const PackageIcon = (p) => (
  <Svg {...p}>
    <path d="M16.5 9.4 7.5 4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </Svg>
)

export const ScaleIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="m3 12 2-5 2 5a2 2 0 0 1-4 0z" />
    <path d="m17 12 2-5 2 5a2 2 0 0 1-4 0z" />
    <path d="M7 21h10" />
  </Svg>
)

export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
)

export const NoteIcon = (p) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </Svg>
)

export const LeafIcon = (p) => (
  <Svg {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </Svg>
)

export const RefreshIcon = (p) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Svg>
)

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
)

export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
)

/** Google'ning rasmiy rangli "G" belgisi. */
export const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
)


/* --------------------------- AGROGRAM 3.0 ikonkalari --------------------------- */

/* Apple logotipi — to'ldirilgan shakl, shuning uchun `fill` ishlatiladi. */
export const AppleIcon = ({ size = 22, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
    <path d="M16.36 12.79c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.61-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.74 2.2 1.1-.05 1.52-.71 2.85-.71 1.33 0 1.71.71 2.87.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.31-3.5z" />
    <path d="M14.2 6.3c.6-.74 1.01-1.76.9-2.78-.87.04-1.93.58-2.56 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.58-1.21z" />
  </svg>
)

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.7 3.7" />
    <path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.5-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </Svg>
)

export const UserPlusIcon = (p) => (
  <Svg {...p}>
    <path d="M15 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </Svg>
)

export const UserCheckIcon = (p) => (
  <Svg {...p}>
    <path d="M15 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="m16 11 2 2 4-4" />
  </Svg>
)

export const UsersIcon = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
)

export const GridIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
)

export const LinkIcon = (p) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </Svg>
)

export const BugIcon = (p) => (
  <Svg {...p}>
    <path d="M8 6a4 4 0 0 1 8 0v2H8Z" />
    <rect x="8" y="8" width="8" height="12" rx="4" />
    <path d="M2 12h6" />
    <path d="M16 12h6" />
    <path d="m3 6 3 2" />
    <path d="m21 6-3 2" />
    <path d="m3 18 3-2" />
    <path d="m21 18-3-2" />
  </Svg>
)

/* ------------------------- Sozlamalar bo'limlari ------------------------- */

/* Bildirishnomalar — qo'ng'iroq. */
export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9" />
    <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
  </Svg>
)

/* Maxfiylik — qalqon. */
export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5.5c0 4.4 3 8.1 7 9.5 4-1.4 7-5.1 7-9.5V6z" />
  </Svg>
)

/* Ma'lumotlar — saqlash bazasi. */
export const DatabaseIcon = (p) => (
  <Svg {...p}>
    <ellipse cx="12" cy="6" rx="7.5" ry="3" />
    <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
    <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
  </Svg>
)

/* Ilova haqida — ma'lumot belgisi. */
export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.75h.01" />
  </Svg>
)

/* Parol — kalit. */
export const KeyIcon = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.9 12.1 7.3-7.3" />
    <path d="m16.5 6.5 2.2 2.2" />
    <path d="m19.3 3.7 1.8 1.8" />
  </Svg>
)

/* Ma'lumotlarni yuklab olish — pastga o'q. */
export const DownloadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4v10" />
    <path d="m8 10.5 4 4 4-4" />
    <path d="M4.5 17v1.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V17" />
  </Svg>
)

/* Hujjat — shartlar va siyosat sahifalari. */
export const FileTextIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 13h7" />
    <path d="M8.5 17h4.5" />
  </Svg>
)

/* Ko'rinish — ranglar palitrasi. */
export const PaletteIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7" />
    <path d="M7.5 12.5h.01" />
    <path d="M9.5 8.5h.01" />
    <path d="M14 7.5h.01" />
  </Svg>
)

/* Onlayn holat — faollik chizig'i. */
export const PulseIcon = (p) => (
  <Svg {...p}>
    <path d="M3 12h3.5L9 5.5l4 13 2.5-6.5H21" />
  </Svg>
)

/* Profil rasmini almashtirish nishoni. */
export const CameraIcon = (p) => (
  <Svg {...p}>
    <path d="M4 8.5h2.6l1.5-2.2h7.8l1.5 2.2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13.2" r="3.3" />
  </Svg>
)

/* ------------------------------ Xabarlar --------------------------------- */

/* Ovozli xabar yozish. */
export const MicIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="2.5" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5V21" />
  </Svg>
)

/* Ovozli qo'ng'iroq. */
export const PhoneCallIcon = (p) => (
  <Svg {...p}>
    <path d="M7.5 3.5 9.8 8l-2 1.9a12 12 0 0 0 6.3 6.3l1.9-2 4.5 2.3v3.1a1 1 0 0 1-1.1 1C10.9 20 4 13.1 3.4 4.6a1 1 0 0 1 1-1.1z" />
  </Svg>
)

/* Video qo'ng'iroq. */
export const VideoIcon = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="m15.5 10.5 6-3.2v9.4l-6-3.2z" />
  </Svg>
)

/* Qo'ng'iroqni tugatish. */
export const PhoneOffIcon = (p) => (
  <Svg {...p}>
    <path d="M2.5 9.6a13.6 13.6 0 0 1 19 0l-2.6 2.6a2 2 0 0 1-2.5.2l-1.3-.9a1 1 0 0 1-.4-.9V8.8a10 10 0 0 0-5.4 0v1.8a1 1 0 0 1-.4.9l-1.3.9a2 2 0 0 1-2.5-.2z" />
    <path d="m3 21 18-18" />
  </Svg>
)

export const PlayIcon = (p) => (
  <Svg {...p}>
    <path d="M8 5.2v13.6L19 12z" fill="currentColor" stroke="none" />
  </Svg>
)

export const PauseIcon = (p) => (
  <Svg {...p}>
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </Svg>
)

/* Karnay (dinamik) yoqilgan. */
export const SpeakerIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M16 9.2a4 4 0 0 1 0 5.6" />
    <path d="M18.6 6.6a7.5 7.5 0 0 1 0 10.8" />
  </Svg>
)

/* Mikrofon o'chirilgan. */
export const MicOffIcon = (p) => (
  <Svg {...p}>
    <path d="M15 5.4A3 3 0 0 0 9 5.5v3.1" />
    <path d="M9 12.4a3 3 0 0 0 4.6 2.4" />
    <path d="M5.5 11a6.5 6.5 0 0 0 9.6 5.7" />
    <path d="M18.5 11a6.5 6.5 0 0 1-.5 2.5" />
    <path d="M12 17.5V21" />
    <path d="m3 3 18 18" />
  </Svg>
)

/* Kamera o'chirilgan. */
export const VideoOffIcon = (p) => (
  <Svg {...p}>
    <path d="M15.5 15.5v.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1" />
    <path d="M8.5 6h5a2 2 0 0 1 2 2v3.2l6-3.9v9.4l-3-1.9" />
    <path d="m3 3 18 18" />
  </Svg>
)

/* Old/orqa kamerani almashtirish. */
export const CameraFlipIcon = (p) => (
  <Svg {...p}>
    <path d="M4 8.5h2.6l1.5-2.2h7.8l1.5 2.2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
    <path d="M9.6 13.2a2.6 2.6 0 0 1 4.4-1.9" />
    <path d="M14.4 13.2a2.6 2.6 0 0 1-4.4 1.9" />
    <path d="M14 9.8v1.6h-1.6" />
    <path d="M10 16.6V15h1.6" />
  </Svg>
)

/* Yuborilgan (bitta belgi). */
export const CheckOneIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
)

/* Yetkazilgan / o'qilgan (ikkita belgi). */
export const CheckTwoIcon = (p) => (
  <Svg {...p}>
    <path d="m1.5 12.5 4.5 4.5L15.5 7" />
    <path d="m9.5 15 1.6 1.6L20.5 7" />
  </Svg>
)

/* Javob berish (o'qning orqaga qaytishi). */
export const ReplyIcon = (p) => (
  <Svg {...p}>
    <path d="M9 7 4 12l5 5" />
    <path d="M4 12h9a6 6 0 0 1 6 6v1" />
  </Svg>
)

/* ------------------------------ E'lonlar --------------------------------- */

/* Saqlash (sevimlilar). `filled` — to'ldirilgan holat. */
export const HeartIcon = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20z" />
  </Svg>
)

/* Ulashish. */
export const ShareIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5v11" />
    <path d="m8 7.2 4-3.7 4 3.7" />
    <path d="M5 13v6a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6" />
  </Svg>
)

/* -------------------------- Chatdagi media ------------------------------- */

export const PaperclipIcon = (p) => (
  <Svg {...p}>
    <path d="M20 11.5 12.2 19.3a4.6 4.6 0 0 1-6.5-6.5l8-8a3.1 3.1 0 0 1 4.4 4.4l-8 8a1.6 1.6 0 0 1-2.2-2.2l7.3-7.3" />
  </Svg>
)

export const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="8.6" cy="9.8" r="1.6" />
    <path d="m3.6 17.2 4.6-4.3a1.6 1.6 0 0 1 2.2 0l3.2 3 2-1.8a1.6 1.6 0 0 1 2.2 0l2.6 2.4" />
  </Svg>
)

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Svg>
)

export const SheetIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9.5h16" />
    <path d="M4 14.5h16" />
    <path d="M12 9.5V20" />
  </Svg>
)

export const ArchiveIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4" width="17" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10.5 12h3" />
  </Svg>
)

export const DownloadFileIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4v9" />
    <path d="m8.5 9.8 3.5 3.5 3.5-3.5" />
    <path d="M5 16v2.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V16" />
  </Svg>
)

/* ---------------- Kalkulyator ikonkalari ---------------------------------- */

/* Super kalkulyator. */
export const CalculatorIcon = (p) => (
  <Svg {...p}>
    <rect x="4.5" y="3" width="15" height="18" rx="2" />
    <path d="M8 7.5h8" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    <path d="M8.5 16h.01M12 16h.01M15.5 16h.01" />
  </Svg>
)

/* Soat — hisob tarixi. */
export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Svg>
)
