/**
 * Mahsulot ranglari.
 *
 * Har bir mahsulot o'z rangiga ega — diagrammalar, ustunlar va nishonlar shu
 * rangdan foydalanadi. Ranglar mahsulotning o'ziga o'xshatib tanlangan
 * (bug'doy — oltin sariq, pomidor — qizil, uzum — binafsha), shuning uchun
 * panel bir rangda emas, jonli ko'rinadi.
 */

import { normalizeSearch } from '../utils.js'

/** Ma'lum mahsulotlar: nomi → { rang, chegara (ochiq ranglar uchun) }. */
const KNOWN = [
  ["bug'doy", '#D4A017'],
  ['paxta', '#F5F5DC', '#8B7355'],
  ['pomidor', '#E74C3C'],
  ['kartoshka', '#C19A6B'],
  ['piyoz', '#DAA520'],
  ['sabzi', '#FF8C00'],
  ['olma', '#27AE60'],
  ['uzum', '#8E44AD'],
  ['sholi', '#F0E68C', '#B8A94A'],
  ['mosh', '#6B8E23'],
  ['lavlagi', '#C0392B'],
  ['bodring', '#2ECC71'],
  ['qovun', '#F39C12'],
  ['tarvuz', '#E91E63'],

  /* Ro'yxatdagi qolgan keng tarqalgan mahsulotlar — ular ham o'z rangiga ega
     bo'lsin, aks holda tasodifiy palitraga tushib qolardi. */
  ['arpa', '#B8860B'],
  ["makkajo'xori", '#FFC300'],
  ['karam', '#7DCE82'],
  ['qalampir', '#D62828'],
  ['baqlajon', '#5B2C6F'],
  ['sarimsoq', '#D9D2C5', '#9C9384'],
  ['turp', '#E8A0BF'],
  ["o'rik", '#F7A440'],
  ['shaftoli', '#FF9E7A'],
  ['anor', '#B03A2E'],
  ['behi', '#E4D354'],
  ['nok', '#A8C256'],
  ['olcha', '#A11D33'],
  ['gilos', '#CC2936'],
  ['anjir', '#6D4C7D'],
  ['xurmo', '#E77E22'],
  ['limon', '#F4D03F'],
  ['qovoq', '#E67E22'],
  ['loviya', '#8C6E4A'],
  ["no'xat", '#C8B560'],
  ['yasmiq', '#CF7C3C'],
  ['kunjut', '#EADDCA', '#A89478'],
  ['kungaboqar', '#F2C230'],
  ["zig'ir", '#9AA5B1'],
  ['tamaki', '#7B5E3B'],
  ["ko'kat", '#4CAF50'],
]

const LOOKUP = new Map()
for (const [name, color, border] of KNOWN) {
  LOOKUP.set(normalizeSearch(name), { color, border: border || null })
}

/**
 * Ro'yxatda yo'q mahsulotlar uchun zaxira palitra — bir-biridan aniq
 * farq qiladigan ranglar (yonma-yon turganda ham ajralib turadi).
 */
const FALLBACK = [
  '#3498DB', '#16A085', '#9B59B6', '#E67E22', '#2C82C9',
  '#D35400', '#1ABC9C', '#C2185B', '#7F8C8D', '#5D6D7E',
  '#AF7AC5', '#48C9B0', '#F1948A', '#5499C7', '#52BE80',
]

/** Nomdan barqaror indeks (har renderda bir xil rang chiqishi uchun). */
function hashOf(name) {
  let h = 0
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Bitta mahsulotning rangi (kontekstsiz). */
export function productColor(product) {
  const key = normalizeSearch(product)
  const known = LOOKUP.get(key)
  if (known) return known.color

  // Qo'shma nomlar: "pushti pomidor" → pomidor.
  for (const [name, entry] of LOOKUP) {
    if (key.includes(name)) return entry.color
  }
  return FALLBACK[hashOf(key) % FALLBACK.length]
}

/** Ochiq ranglar (paxta, sholi, kunjut) uchun chegara rangi. */
export function productBorder(product) {
  const key = normalizeSearch(product)
  const known = LOOKUP.get(key)
  return known?.border ?? null
}

/**
 * Ro'yxat uchun ranglar: yonma-yon turgan ikkita element hech qachon bir xil
 * rangda bo'lmaydi. Ma'lum mahsulotlar o'z rangini saqlab qoladi; faqat
 * zaxira palitradan olingan takrorlar suriladi.
 */
export function assignColors(products) {
  const out = new Map()
  let prev = null

  products.forEach((product, i) => {
    const key = normalizeSearch(product)
    let color = productColor(product)

    if (color === prev && !LOOKUP.has(key)) {
      // Zaxira rang qo'shni bilan bir xil bo'lib qoldi — keyingisini olamiz.
      const start = FALLBACK.indexOf(color)
      color = FALLBACK[(start + 1 + i) % FALLBACK.length]
    }

    out.set(product, color)
    prev = color
  })

  return out
}

/* ------------------------- Tungi rejimga moslash ------------------------- */

function hexToRgb(hex) {
  const v = hex.replace('#', '')
  const n = v.length === 3 ? v.split('').map((c) => c + c).join('') : v
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ]
}

function rgbToHex(r, g, b) {
  const to = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/**
 * Tungi rejimda ranglar biroz yumshatiladi: juda to'q ranglar yorug'roq,
 * juda och (oq-oqish) ranglar esa sal to'qroq bo'ladi — ikkalasi ham
 * qora fonda o'qilishi uchun.
 */
export function forDark(hex) {
  const [r, g, b] = hexToRgb(hex)
  // Idrok etiladigan yorqinlik (0..255).
  const lum = 0.299 * r + 0.587 * g + 0.114 * b

  if (lum < 110) {
    // To'q rang — oqqa qarab suriladi.
    const k = 0.34
    return rgbToHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k)
  }
  if (lum > 205) {
    // Juda och rang — sal so'ndiriladi, aks holda oq fondek yaltiraydi.
    const k = 0.18
    return rgbToHex(r * (1 - k), g * (1 - k), b * (1 - k))
  }
  return hex
}

/** Mavzuga qarab rang (diagrammalar uchun yagona kirish nuqtasi). */
export function themedColor(product, isDark) {
  const base = productColor(product)
  return isDark ? forDark(base) : base
}
