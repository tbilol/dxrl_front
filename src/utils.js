const MONTHS = {
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
}

/** Backend UTC ni vaqt zonasi belgisisiz yuboradi — shuning uchun 'Z' qo'shamiz. */
export function parseDate(value) {
  if (!value) return null
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
  const d = new Date(hasZone ? value : `${value}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function pad(n) {
  return String(n).padStart(2, '0')
}

/** "6 avg, 14:30" / "6 авг, 14:30" */
export function formatDate(value, lang = 'uz') {
  const d = parseDate(value)
  if (!d) return ''
  const months = MONTHS[lang] || MONTHS.uz
  return `${d.getDate()} ${months[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "14:30" */
export function formatTime(value) {
  const d = parseDate(value)
  if (!d) return ''
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Suhbatlar ro'yxati uchun: bugun → soat, kecha → "Kecha", aks holda sana. */
export function formatChatTime(value, lang, t) {
  const d = parseDate(value)
  if (!d) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return formatTime(value)

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('messages.yesterday')

  const months = MONTHS[lang] || MONTHS.uz
  return `${d.getDate()} ${months[d.getMonth()]}`
}

/** Chatdagi kun ajratgichi. */
export function formatDayDivider(value, lang, t) {
  const d = parseDate(value)
  if (!d) return ''
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return t('messages.today')

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('messages.yesterday')

  const months = MONTHS[lang] || MONTHS.uz
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function sameDay(a, b) {
  const da = parseDate(a)
  const db = parseDate(b)
  if (!da || !db) return false
  return da.toDateString() === db.toDateString()
}

/** Ming ajratgichli son: 12 500 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

/** Formadagi narx maydoni uchun: "1000000" → "1 000 000" */
export function formatMoneyInput(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('ru-RU').replace(/ /g, ' ')
}

export function moneyToNumber(display) {
  const digits = String(display ?? '').replace(/\D/g, '')
  return digits ? Number(digits) : null
}

/** Telefon maskasi: har qanday kiritmani "+998 90 123 45 67" ko'rinishiga keltiradi. */
export function formatPhoneInput(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  digits = digits.slice(0, 9)

  const groups = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean)

  return groups.length ? `+998 ${groups.join(' ')}` : '+998 '
}

/** To'liq raqam: +998 va 9 ta raqam. */
export function isPhoneComplete(value) {
  return String(value ?? '').replace(/\D/g, '').replace(/^998/, '').length === 9
}

export function initials(name) {
  return String(name || '?')
    .trim()
    .charAt(0)
    .toUpperCase()
}

/** O'zbekiston viloyatlari — manzil tanlash uchun. */
export const REGIONS = [
  { uz: 'Toshkent shahri', ru: 'город Ташкент' },
  { uz: 'Toshkent viloyati', ru: 'Ташкентская область' },
  { uz: 'Andijon', ru: 'Андижанская область' },
  { uz: "Farg'ona", ru: 'Ферганская область' },
  { uz: 'Namangan', ru: 'Наманганская область' },
  { uz: 'Samarqand', ru: 'Самаркандская область' },
  { uz: 'Buxoro', ru: 'Бухарская область' },
  { uz: 'Navoiy', ru: 'Навоийская область' },
  { uz: 'Qashqadaryo', ru: 'Кашкадарьинская область' },
  { uz: 'Surxondaryo', ru: 'Сурхандарьинская область' },
  { uz: 'Jizzax', ru: 'Джизакская область' },
  { uz: 'Sirdaryo', ru: 'Сырдарьинская область' },
  { uz: 'Xorazm', ru: 'Хорезмская область' },
  { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан' },
]

export function regionLabel(region, lang) {
  return lang === 'ru' ? region.ru : region.uz
}

export const ROLE_KEYS = {
  dehqon: 'role.dehqon',
  sotib_oluvchi: 'role.sotib_oluvchi',
}
