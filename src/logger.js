/**
 * AGROGRAM — brauzer konsoli uchun ranglangan loglar.
 *
 * Yoqish:  localStorage.setItem('AGROGRAM_DEBUG', 'true')   (brauzer konsolidan)
 * O'chirish: localStorage.removeItem('AGROGRAM_DEBUG')
 *
 * Bu faqat dasturchi uchun konsol kaliti — sozlamalarda tugmasi yo'q.
 *
 * Debug o'chiq bo'lsa faqat xatolar chiqadi — ilova ishlashi bir xil qoladi.
 * Loglar faqat konsolda (F12) ko'rinadi, interfeysga ta'sir qilmaydi.
 */

export const DEBUG_KEY = 'AGROGRAM_DEBUG'

const LOGS = {
  FRONT: { color: '#4CAF50', emoji: '🟢' }, // UI hodisalari, render, holat
  API: { color: '#2196F3', emoji: '🔵' }, //   so'rov va javoblar
  AUTH: { color: '#FF9800', emoji: '🟠' }, //  kirish, chiqish, token
  CHAT: { color: '#9C27B0', emoji: '🟣' }, //  xabarlar, suhbatlar
  I18N: { color: '#00BCD4', emoji: '🔷' }, //  til almashinuvi
  STORE: { color: '#795548', emoji: '🟤' }, // localStorage, holat saqlash
  NAV: { color: '#607D8B', emoji: '⚪' }, //   marshrut o'zgarishi
  ERROR: { color: '#F44336', emoji: '🔴' }, // barcha xatolar
}

const ERROR_COLOR = LOGS.ERROR.color

function readDebug() {
  try {
    return localStorage.getItem(DEBUG_KEY) === 'true'
  } catch {
    // Maxfiy rejimda localStorage bloklangan bo'lishi mumkin.
    return false
  }
}

let debugEnabled = readDebug()

const time = () => new Date().toLocaleTimeString()

const log = {}

Object.entries(LOGS).forEach(([key, { color, emoji }]) => {
  const lower = key.toLowerCase()

  log[lower] = (message, ...data) => {
    if (!debugEnabled) return // debug o'chiq — oddiy loglar chiqmaydi
    console.log(
      `%c${emoji} [${key}] ${time()} — ${message}`,
      `color: ${color}; font-weight: bold;`,
      ...data,
    )
  }

  // Xatolar debug holatidan qat'i nazar doim chiqadi.
  log[lower].error = (message, ...data) => {
    console.error(
      `%c🔴 [${key}:ERROR] ${time()} — ${message}`,
      `color: ${ERROR_COLOR}; font-weight: bold;`,
      ...data,
    )
    // Stack trace — xato obyekti bo'lsa o'shaniki, bo'lmasa chaqiruv joyi.
    const err = data.find((d) => d instanceof Error)
    if (err?.stack) console.error(err.stack)
    else if (debugEnabled) console.trace()
  }
})

/** Guruhlangan log (masalan sahifa yuklanishi) — debug o'chiq bo'lsa jim. */
log.group = (label, fn) => {
  if (!debugEnabled) {
    fn?.()
    return
  }
  console.groupCollapsed(`%c▾ ${label}`, 'color: #607D8B; font-weight: bold;')
  try {
    fn?.()
  } finally {
    console.groupEnd()
  }
}

log.isDebug = () => debugEnabled

if (typeof window !== 'undefined') {
  // Konsoldan qo'lda boshqarish uchun.
  window.AGROGRAM_LOG = log
}

export default log
