/**
 * Statistika hisob-kitoblari — barchasi mijoz tomonida, sof funksiyalar.
 *
 * Backendda filtrlangan statistika endpointlari yo'q (faqat umumiy "top-10"
 * va sanoq bor), shuning uchun e'lonlar ro'yxati bir marta olinadi va
 * barcha kesimlar shu yerda hisoblanadi.
 *
 * Pul birligi: e'londagi narx — so'm/kg, hajm — tonna.
 * Demak oborot = hajm × 1000 × narx (so'm).
 */

import { parseDate, normalizeSearch } from '../utils.js'
import { parseAddress } from './catalog.js'

export const PERIODS = ['today', 'week', 'month', 'all']
export const DEFAULT_PERIOD = 'month'

/** Tanlangan davrning boshlanish vaqti (null — barcha vaqt). */
export function periodStart(period, now = new Date()) {
  const d = new Date(now)
  switch (period) {
    case 'today':
      d.setHours(0, 0, 0, 0)
      return d
    case 'week': {
      // Hafta dushanbadan boshlanadi.
      const day = (d.getDay() + 6) % 7
      d.setDate(d.getDate() - day)
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'month':
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return d
    default:
      return null
  }
}

/** E'lonni normallashtirilgan ko'rinishga keltiradi (kind — 'offer' | 'request'). */
export function normalizeItem(item, kind) {
  const { region, district } = parseAddress(item.address)
  const price = kind === 'offer' ? item.price : item.offer_price
  const quantity = Number(item.quantity) || 0
  const perKg = price == null ? null : Number(price) || 0

  return {
    id: item.id,
    kind,
    product: item.product,
    productKey: normalizeSearch(item.product),
    quantity,
    /** so'm/kg */
    price: perKg,
    /** so'm/tonna — diagrammalarda shu ko'rsatiladi */
    pricePerTon: perKg == null ? null : perKg * 1000,
    /** umumiy summa, so'm */
    revenue: perKg == null ? 0 : quantity * 1000 * perKg,
    region,
    district,
    date: parseDate(item.created_at),
    ownerId: item.owner?.id ?? item.owner_id ?? null,
    ownerName: item.owner?.name || item.farmer_name || item.buyer_name || '',
    ownerAvatar: item.owner?.avatar_url ?? null,
  }
}

/** Davr + hudud bo'yicha saralash. */
export function applyFilters(items, { period, region, district }, now = new Date()) {
  const from = periodStart(period, now)
  return items.filter((it) => {
    if (from && (!it.date || it.date < from)) return false
    if (region && it.region !== region) return false
    if (district && it.district !== district) return false
    return true
  })
}

/** Kaskadli filtr uchun: tanlangan viloyatdagi tumanlar (e'lonlardan). */
export function districtOptions(items, region) {
  if (!region) return []
  const map = new Map()
  for (const it of items) {
    if (it.region === region && it.district) {
      map.set(it.district, (map.get(it.district) ?? 0) + 1)
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
}

/* --------------------------- Mahsulot kesimlari -------------------------- */

function groupByProduct(items) {
  const map = new Map()
  for (const it of items) {
    if (!it.product) continue
    let row = map.get(it.productKey)
    if (!row) {
      row = { product: it.product, quantity: 0, revenue: 0, count: 0, prices: [] }
      map.set(it.productKey, row)
    }
    row.quantity += it.quantity
    row.revenue += it.revenue
    row.count += 1
    if (it.pricePerTon != null && it.pricePerTon > 0) row.prices.push(it.pricePerTon)
  }
  return [...map.values()]
}

function withShare(rows, field, limit) {
  const total = rows.reduce((sum, r) => sum + r[field], 0)
  return rows.slice(0, limit).map((r) => ({
    ...r,
    quantity: round(r.quantity),
    share: total > 0 ? (r[field] / total) * 100 : 0,
  }))
}

/** 1) Eng ko'p sotilgan mahsulotlar — vazn bo'yicha. */
export function topProductsByWeight(items, limit = 15) {
  const rows = groupByProduct(items).sort((a, b) => b.quantity - a.quantity)
  return withShare(rows, 'quantity', limit)
}

/** 2) Eng katta summaga sotilgan mahsulotlar — oborot bo'yicha. */
export function topProductsByRevenue(items, limit = 15) {
  const rows = groupByProduct(items)
    .filter((r) => r.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
  return withShare(rows, 'revenue', limit)
}

/* ------------------------------- Reyting --------------------------------- */

/**
 * Odamlar reytingi (dehqonlar yoki xaridorlar).
 * by — 'quantity' (vazn) yoki 'revenue' (summa).
 */
export function rankPeople(items, by = 'quantity', limit = 15) {
  const map = new Map()

  for (const it of items) {
    const key = it.ownerId || it.ownerName
    if (!key) continue
    let row = map.get(key)
    if (!row) {
      row = {
        key,
        id: it.ownerId,
        name: it.ownerName,
        avatar: it.ownerAvatar,
        region: it.region,
        district: it.district,
        quantity: 0,
        revenue: 0,
        count: 0,
        products: new Map(),
      }
      map.set(key, row)
    }
    row.count += 1
    row.quantity += it.quantity
    row.revenue += it.revenue
    row.products.set(it.product, (row.products.get(it.product) ?? 0) + it.quantity)
    if (!row.region && it.region) row.region = it.region
    if (!row.district && it.district) row.district = it.district
  }

  const rows = [...map.values()].map((row) => {
    const top = [...row.products.entries()].sort((a, b) => b[1] - a[1])[0]
    const { products, ...rest } = row
    return {
      ...rest,
      quantity: round(row.quantity),
      variety: products.size,
      topProduct: top ? top[0] : null,
    }
  })

  const cmp =
    by === 'revenue'
      ? (a, b) => b.revenue - a.revenue || b.quantity - a.quantity
      : (a, b) => b.quantity - a.quantity || b.count - a.count

  return rows.sort(cmp).slice(0, limit)
}

/* ------------------------------ Narx dinamikasi --------------------------- */

/** Tanlangan davr uchun vaqt bo'laklari (chiziqli diagramma o'qi). */
export function buckets(period, now = new Date()) {
  const out = []
  const push = (start, end, label) => out.push({ start, end, label })

  if (period === 'today') {
    const base = new Date(now)
    base.setHours(0, 0, 0, 0)
    for (let h = 0; h < 24; h += 4) {
      const start = new Date(base)
      start.setHours(h)
      const end = new Date(start)
      end.setHours(h + 4)
      push(start, end, `${String(h).padStart(2, '0')}:00`)
    }
    return out
  }

  if (period === 'week' || period === 'month') {
    const from = periodStart(period, now)
    // Faqat o'tgan kunlar — oxirida bo'sh ustun qolmasin.
    const days = Math.max(1, Math.floor((now - from) / 86400000) + 1)
    // Oy uzun bo'lsa — kunlarni birlashtiramiz, o'q siqilib ketmasin.
    const step = days > 16 ? 3 : 1
    for (let i = 0; i < days; i += step) {
      const start = new Date(from)
      start.setDate(from.getDate() + i)
      const end = new Date(start)
      end.setDate(start.getDate() + step)
      push(start, end, `${start.getDate()}`)
    }
    return out
  }

  // Barcha vaqt — oxirgi 12 oy.
  for (let i = 11; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    push(start, end, `${start.getMonth() + 1}/${String(start.getFullYear()).slice(2)}`)
  }
  return out
}

/**
 * 7) Eng ko'p savdo qilinadigan 5 ta mahsulot uchun narx dinamikasi.
 * Narx — so'm/tonna. Natija: { products, rows: [{ label, <mahsulot>: narx }] }
 */
export function priceTrend(items, period, now = new Date(), limit = 5) {
  const top = topProductsByWeight(items, limit).map((r) => r.product)
  if (top.length === 0) return { products: [], rows: [] }

  const keys = new Map(top.map((p) => [normalizeSearch(p), p]))
  const slots = buckets(period, now)

  const rows = slots.map((slot) => {
    const row = { label: slot.label }
    const sums = new Map()

    for (const it of items) {
      if (it.pricePerTon == null || it.pricePerTon <= 0 || !it.date) continue
      if (it.date < slot.start || it.date >= slot.end) continue
      const name = keys.get(it.productKey)
      if (!name) continue
      const acc = sums.get(name) ?? { sum: 0, n: 0 }
      acc.sum += it.pricePerTon
      acc.n += 1
      sums.set(name, acc)
    }

    for (const name of top) {
      const acc = sums.get(name)
      // Ma'lumot yo'q bo'lsa null — chiziq uzilib turadi (connectNulls uni bog'laydi).
      row[name] = acc ? Math.round(acc.sum / acc.n) : null
    }
    return row
  })

  return { products: top, rows }
}

/* ------------------------------- Hududlar --------------------------------- */

/** 8) Eng faol hududlar — bitimlar soni (takliflar + so'rovlar) bo'yicha. */
export function activeRegions(offers, requests, limit = 14) {
  const map = new Map()
  const add = (it) => {
    const key = it.region || '—'
    const row = map.get(key) ?? { region: key, count: 0, quantity: 0, offers: 0, requests: 0 }
    row.count += 1
    row.quantity += it.quantity
    row[it.kind === 'offer' ? 'offers' : 'requests'] += 1
    map.set(key, row)
  }
  offers.forEach(add)
  requests.forEach(add)

  const rows = [...map.values()]
    .map((r) => ({ ...r, quantity: round(r.quantity) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  // Faollik darajasi 0..1 — ustun rangining to'qligi shunga bog'liq.
  const max = rows[0]?.count ?? 0
  return rows.map((r) => ({ ...r, intensity: max > 0 ? r.count / max : 0 }))
}

/* ------------------------------- Umumiy ---------------------------------- */

/** Sahifa tepasidagi katta ko'rsatkichlar. */
export function summarize(items) {
  const people = new Set(items.map((it) => it.ownerId || it.ownerName).filter(Boolean))
  const priced = items.filter((it) => it.pricePerTon != null && it.pricePerTon > 0)
  return {
    count: items.length,
    quantity: round(items.reduce((sum, it) => sum + it.quantity, 0)),
    revenue: items.reduce((sum, it) => sum + it.revenue, 0),
    avgPricePerTon: priced.length
      ? Math.round(priced.reduce((a, b) => a + b.pricePerTon, 0) / priced.length)
      : 0,
    people: people.size,
  }
}

function round(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}
