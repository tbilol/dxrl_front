const MONTHS_UZ = [
  'yan',
  'fev',
  'mar',
  'apr',
  'may',
  'iyun',
  'iyul',
  'avg',
  'sen',
  'okt',
  'noy',
  'dek',
]

/** Backend UTC ni vaqt zonasi belgisisiz yuboradi — shuning uchun 'Z' qo'shamiz. */
function parseDate(value) {
  if (!value) return null
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
  const d = new Date(hasZone ? value : `${value}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 6 avg, 14:30 ko'rinishida sana. */
export function formatDate(value) {
  const d = parseDate(value)
  if (!d) return ''
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getDate()} ${MONTHS_UZ[d.getMonth()]}, ${time}`
}

/** Ming ajratgichli son: 12 500 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

export const ROLE_LABELS = {
  dehqon: 'Dehqon',
  sotib_oluvchi: 'Sotib oluvchi',
}
