/**
 * MOCK: e'lonlar — dehqon takliflari (offer) va olib sotuvchi so'rovlari (request).
 *
 * Ro'yxat, tafsilot, yaratish, tahrirlash va o'chirish — hammasi brauzer
 * xotirasidagi bazada (db.js).
 */

import db, { currentProfile, decorate, save } from './db.js'
import { LISTING_LIMIT } from '../../limits.js'
import { delay, NORMAL, nowIso, SHORT, trace, uid } from './util.js'

function byKind(kind, params = {}) {
  let rows = db.listings.filter((l) => l.kind === kind)
  if (params.owner_id) rows = rows.filter((l) => l.owner_id === params.owner_id)
  // Doskada faqat faol e'lonlar; egasining ro'yxatida (owner_id) — hammasi.
  const status = params.status ?? (params.owner_id ? 'all' : 'active')
  if (status !== 'all') rows = rows.filter((l) => (l.status ?? 'active') === status)
  if (params.product) {
    const q = String(params.product).toLowerCase()
    rows = rows.filter((l) => l.product.toLowerCase().includes(q))
  }
  // Yangilari birinchi.
  return rows
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .map(decorate)
}

function one(kind, id) {
  const found = db.listings.find((l) => l.kind === kind && String(l.id) === String(id))
  if (!found) {
    const err = new Error('E\'lon topilmadi')
    err.response = { status: 404, data: { detail: 'E\'lon topilmadi' } }
    throw err
  }
  return decorate(found)
}

function activeOf(kind, userId) {
  return db.listings.filter(
    (l) => l.kind === kind && l.owner_id === userId && (l.status ?? 'active') === 'active',
  ).length
}

/** MOCK: backend kvotasi — har bir doskada 10 ta faol e'lon (409 qaytaradi). */
function assertQuota(kind, userId) {
  if (activeOf(kind, userId) < LISTING_LIMIT) return
  const err = new Error('Listing limit reached')
  err.response = {
    status: 409,
    data: { code: 'listing_limit', limit: LISTING_LIMIT, detail: "Faol e'lonlar chegarasi tugadi" },
  }
  throw err
}

function create(kind, data) {
  const me = currentProfile()
  if (me) assertQuota(kind, me.id)
  const listing = {
    ...data,
    id: uid(kind),
    kind,
    created_at: nowIso(),
    status: 'active',
    owner_id: me?.id ?? null,
    views_count: 0,
    has_video: Boolean(data.has_video),
  }
  db.listings.unshift(listing)
  save()
  return decorate(listing)
}

function update(kind, id, data) {
  const found = db.listings.find((l) => l.kind === kind && String(l.id) === String(id))
  if (!found) return one(kind, id)
  // Yopilgan e'lonni qayta faollashtirish ham kvotaga kiradi.
  if (data.status === 'active' && found.status !== 'active') assertQuota(kind, found.owner_id)
  Object.assign(found, data, { updated_at: nowIso() })
  save()
  return decorate(found)
}

function remove(kind, id) {
  const i = db.listings.findIndex((l) => l.kind === kind && String(l.id) === String(id))
  if (i >= 0) db.listings.splice(i, 1)
  save()
  return { ok: true }
}

/* ------------------------------- Takliflar ------------------------------- */

// MOCK: dehqon takliflari ro'yxati.
export const getOffers = (params) => delay(() => byKind('offer', params), SHORT)
export const getOffer = (id) => delay(() => one('offer', id), SHORT)
export const createOffer = (data) => delay(() => create('offer', data), NORMAL)
export const updateOffer = (id, data) => delay(() => update('offer', id, data), NORMAL)
export const deleteOffer = (id) => delay(() => remove('offer', id), SHORT)

/* -------------------------------- So'rovlar ------------------------------ */

// MOCK: olib sotuvchilarning sotib olish so'rovlari.
export const getRequests = (params) => delay(() => byKind('request', params), SHORT)
export const getRequest = (id) => delay(() => one('request', id), SHORT)
export const createRequest = (data) => delay(() => create('request', data), NORMAL)
export const updateRequest = (id, data) => delay(() => update('request', id, data), NORMAL)
export const deleteRequest = (id) => delay(() => remove('request', id), SHORT)

/**
 * MOCK: e'lon rasmlarini yuklash.
 * Rasmlar hozircha faqat brauzerda (src/listings/images.js) saqlanadi —
 * bu funksiya muvaffaqiyatli javob qaytaradi, xolos.
 */
export function uploadListingImages(id, files) {
  trace('uploadListingImages', { id, count: files?.length ?? 0 })
  return delay({ ok: true, uploaded: files?.length ?? 0 }, NORMAL)
}

/**
 * MOCK: foydalanuvchining shu doskadagi FAOL e'lonlari soni — chegara
 * (10 ta / doska) uchun. Backend kvotasi bilan bir xil: faqat 'active'.
 */
export function countMyListings(kind, userId) {
  return delay(() => activeOf(kind, userId), SHORT)
}
