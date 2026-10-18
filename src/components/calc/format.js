/**
 * Kalkulyator uchun son ko'rinishi.
 *
 * Minglar BO'SH JOY bilan ajratiladi: 10000 → "10 000", 1000000 → "1 000 000".
 * (utils.js dagi formatNumber() ro'yxatlar uchun mo'ljallangan va
 * `toLocaleString` ga tayanadi — bu yerda ajratgich aniq bo'lishi kerak.)
 *
 * Kiritilayotgan matn ham qabul qilinadi: "1234." → "1 234." — ya'ni
 * foydalanuvchi nuqta qo'yganda u ekrandan yo'qolib qolmaydi.
 */

/** Butun qismni uch xonadan bo'sh joy bilan ajratadi. */
function groupThousands(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function formatAmount(value) {
  if (value === null || value === undefined || value === '') return ''

  const raw = String(value)
  if (raw === '-') return raw
  if (!Number.isFinite(Number(raw)) && !/^-?\d*\.?\d*$/.test(raw)) return raw

  const negative = raw.startsWith('-')
  const body = negative ? raw.slice(1) : raw
  const [int = '', frac] = body.split('.')
  const head = groupThousands(int || '0')
  const tail = frac !== undefined ? `.${frac}` : body.endsWith('.') ? '.' : ''

  return `${negative ? '-' : ''}${head}${tail}`
}

/** Hisob natijasi: uzun kasr qismi qirqiladi, so'ng bo'sh joy bilan ajratiladi. */
export function formatResult(value) {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 1e9) / 1e9
  return formatAmount(String(rounded))
}
