/** Statistika uchun son ko'rinishlari. */

import { formatNumber } from '../utils.js'

const MLRD = 1_000_000_000
const MLN = 1_000_000
const MING = 1_000

function trim(n, digits = 1) {
  const v = Math.round(n * 10 ** digits) / 10 ** digits
  return String(v).replace('.', ',')
}

/**
 * Katta pul summasi: "1,2 mlrd so'm", "340 mln so'm", "850 ming so'm".
 * `t` — tarjima funksiyasi (birlik nomlari tilga qarab o'zgaradi).
 */
export function formatSum(value, t, { withUnit = true } = {}) {
  const v = Number(value) || 0
  const som = withUnit ? ` ${t('units.som')}` : ''

  if (v >= MLRD) return `${trim(v / MLRD)} ${t('units.mlrd')}${som}`
  if (v >= MLN) return `${trim(v / MLN, v / MLN >= 100 ? 0 : 1)} ${t('units.mln')}${som}`
  if (v >= MING) return `${trim(v / MING, 0)} ${t('units.ming')}${som}`
  return `${formatNumber(Math.round(v))}${som}`
}

/** Hajm: "2 450 t". */
export function formatTons(value, t) {
  return `${formatNumber(Math.round(Number(value) || 0))} ${t('units.tonShort')}`
}

/** Ulush: "18,4%". */
export function formatShare(value) {
  return `${trim(Number(value) || 0)}%`
}

/** Diagramma o'qi uchun juda qisqa son: 1,2 mlrd → "1,2mlrd". */
export function compactAxis(value, t) {
  const v = Number(value) || 0
  if (v >= MLRD) return `${trim(v / MLRD)}${t('units.mlrdShort')}`
  if (v >= MLN) return `${trim(v / MLN, 0)}${t('units.mlnShort')}`
  if (v >= MING) return `${trim(v / MING, 0)}${t('units.mingShort')}`
  return String(Math.round(v * 10) / 10)
}
