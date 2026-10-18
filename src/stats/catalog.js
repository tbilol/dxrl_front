/**
 * Statistika uchun manzil ma'lumotnomasi.
 *
 * Ilgari bu yerda mahsulot kategoriyalari ham bor edi (don, sabzavot, meva...).
 * Yangi panelda ranglar va kesimlar kategoriya emas, MAHSULOTNING O'ZI bo'yicha
 * quriladi (stats/products.js), shuning uchun kategoriya jadvali olib tashlandi.
 */

import { normalizeSearch, REGIONS } from '../utils.js'

/**
 * Manzil satridan viloyat va tumanni ajratadi.
 * Kutilgan ko'rinish: "Samarqand, Urgut tumani" (formadagi tartib shunday).
 */
export function parseAddress(address) {
  const raw = String(address ?? '').trim()
  if (!raw) return { region: null, district: null }

  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean)
  const head = normalizeSearch(parts[0] ?? '')

  const match = REGIONS.find(
    (r) => normalizeSearch(r.uz) === head || normalizeSearch(r.ru) === head,
  )

  // Viloyat topilmasa — birinchi bo'lak baribir hudud nomi sifatida qoladi.
  const region = match ? match.uz : parts[0] || null
  const district = parts.slice(1).join(', ') || null
  return { region, district }
}
