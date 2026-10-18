/**
 * Oddiy kalkulyator mantig'i — toza funksiya, React dan mustaqil.
 *
 * Holat:
 *   acc   — saqlangan son (amal bosilganda ekrandagi qiymat shu yerga o'tadi)
 *   op    — kutilayotgan amal belgisi yoki null
 *   entry — terilayotgan son, MATN ko'rinishida ("12.", "0.50" kabi oraliq
 *           holatlar to'g'ri ko'rinishi uchun)
 *   fresh — keyingi raqam yangi sondan boshlanadimi
 */

export const OPS = {
  '÷': (a, b) => (b === 0 ? NaN : a / b),
  '×': (a, b) => a * b,
  '−': (a, b) => a - b,
  '+': (a, b) => a + b,
}

export const EMPTY = { acc: null, op: null, entry: '0', fresh: true }

export function pressKey(state, key) {
  const { acc, op, entry, fresh } = state
  const current = Number(entry || '0')

  /* ------------------------------- Tozalash ------------------------------ */
  if (key === 'C') return EMPTY

  if (key === '⌫') {
    if (fresh) return state
    const next = entry.slice(0, -1)
    return { ...state, entry: next === '' || next === '-' ? '0' : next, fresh: next === '' }
  }

  /* -------------------------------- Raqam -------------------------------- */
  if (/^\d$/.test(key)) {
    const next = fresh || entry === '0' ? key : entry + key
    return { ...state, entry: next, fresh: false }
  }

  if (key === '.') {
    if (fresh) return { ...state, entry: '0.', fresh: false }
    return entry.includes('.') ? state : { ...state, entry: `${entry}.`, fresh: false }
  }

  if (key === '±') {
    if (entry === '0') return state
    return { ...state, entry: entry.startsWith('-') ? entry.slice(1) : `-${entry}` }
  }

  if (key === '%') {
    return { ...state, entry: String(current / 100), fresh: false }
  }

  /* --------------------------------- Amal -------------------------------- */
  if (key in OPS) {
    // Ketma-ket amal: oldingisi shu yerda yopiladi (2 + 3 × → 5 ×).
    if (op !== null && !fresh) {
      const value = OPS[op](acc ?? 0, current)
      return { acc: value, op: key, entry: String(value), fresh: true }
    }
    return { acc: current, op: key, entry: String(current), fresh: true }
  }

  if (key === '=') {
    if (op === null) return { ...state, fresh: true }
    const value = OPS[op](acc ?? 0, current)
    return { acc: null, op: null, entry: String(value), fresh: true }
  }

  return state
}
