/**
 * MOCK: tranzaksiya (bitim) — eskrov oqimi.
 *
 * Bitim ikki tomon kelishgach e'lon sahifasidan boshlanadi va yetti
 * bosqichdan o'tadi. Har bir bosqich — alohida MOCK chaqiruv: qisqa kutish,
 * so'ng muvaffaqiyat. Pul harakati, tarozi cheki tekshiruvi va bonus
 * hisoblash backend (mikroservislar) zimmasida bo'ladi.
 */

import db, { currentProfile, findProfile, save } from './db.js'
import { delay, LONG, NORMAL, nowIso, uid } from './util.js'

/**
 * Bosqichlar ketma-ketligi.
 * `actor` — bosqichni kim bajaradi: 'reseller' | 'farmer' | 'system'.
 */
export const STEPS = [
  { key: 'pay', actor: 'reseller' },            // MOCK: mablag' MCHJ eskrov hisobiga o'tkaziladi
  { key: 'escrow', actor: 'system' },           // MOCK: mablag' ushlab turiladi, dehqon xabardor qilinadi
  { key: 'collect', actor: 'reseller' },        // olib sotuvchi mahsulotni olib ketadi
  { key: 'receipt', actor: 'reseller' },        // MOCK: tarozi cheki tekshiriladi
  { key: 'handover', actor: 'farmer' },         // dehqon topshirganini tasdiqlaydi
  { key: 'received', actor: 'reseller' },       // olib sotuvchi qabul qilganini tasdiqlaydi
  { key: 'payout', actor: 'system' },           // MOCK: to'lov dehqonga chiqariladi
]

export const STEP_KEYS = STEPS.map((s) => s.key)

/** Bonus: bitim summasining 0,5 foizi (mantiq hali loyihalanmagan — taxminiy). */
const BONUS_RATE = 0.005

function decorate(tx) {
  const farmer = findProfile(tx.farmer_id)
  const reseller = findProfile(tx.reseller_id)
  const me = db.currentUserId
  return {
    ...tx,
    farmer: farmer ? { id: farmer.id, name: farmer.name, avatar_url: farmer.avatar_url, rating: farmer.rating } : null,
    reseller: reseller
      ? { id: reseller.id, name: reseller.name, avatar_url: reseller.avatar_url, rating: reseller.rating }
      : null,
    my_role: me === tx.farmer_id ? 'farmer' : me === tx.reseller_id ? 'reseller' : 'guest',
    step_key: STEP_KEYS[tx.step] ?? 'done',
  }
}

function find(id) {
  return db.transactions.find((tx) => String(tx.id) === String(id)) ?? null
}

/**
 * MOCK: e'londan bitim boshlash.
 * Taklif (offer) bo'lsa: egasi — dehqon, joriy foydalanuvchi — olib sotuvchi.
 * So'rov (request) bo'lsa: aksincha.
 */
export function createTransaction({ listing_id: listingId }) {
  return delay(() => {
    const me = currentProfile()
    const listing = db.listings.find((l) => String(l.id) === String(listingId))
    if (!listing) {
      const err = new Error("E'lon topilmadi")
      err.response = { status: 404, data: { detail: "E'lon topilmadi" } }
      throw err
    }

    const existing = db.transactions.find(
      (tx) => String(tx.listing_id) === String(listingId) && tx.status !== 'done' &&
        (tx.farmer_id === me.id || tx.reseller_id === me.id),
    )
    if (existing) return decorate(existing)

    const isOffer = listing.kind === 'offer'
    const pricePerKg = (isOffer ? listing.price : listing.offer_price) ?? 0

    const tx = {
      id: uid('tx'),
      listing_id: listing.id,
      kind: listing.kind,
      product: listing.product,
      quantity: listing.quantity,
      price_per_kg: pricePerKg,
      // Narx kg uchun saqlanadi, miqdor — tonnada.
      total: Math.round(pricePerKg * listing.quantity * 1000),
      farmer_id: isOffer ? listing.owner_id : me.id,
      reseller_id: isOffer ? me.id : listing.owner_id,
      step: 0,
      status: 'active',
      receipt: null,
      bonus: 0,
      history: [],
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    db.transactions.push(tx)
    save()
    return decorate(tx)
  }, NORMAL)
}

export function getTransactions() {
  return delay(() => {
    const me = db.currentUserId
    return db.transactions
      .filter((tx) => tx.farmer_id === me || tx.reseller_id === me)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map(decorate)
  }, 250)
}

export function getTransaction(id) {
  return delay(() => {
    const tx = find(id)
    if (!tx) {
      const err = new Error('Tranzaksiya topilmadi')
      err.response = { status: 404, data: { detail: 'Tranzaksiya topilmadi' } }
      throw err
    }
    return decorate(tx)
  }, 250)
}

function complete(tx) {
  tx.status = 'done'
  tx.completed_at = nowIso()

  // MOCK: bitim yakunlangach ikkala tomon reytingi ko'tariladi.
  const bump = (profile) => {
    if (!profile) return
    const count = profile.rating_count ?? 0
    // Yangi baho — 5.0; o'rtacha qayta hisoblanadi.
    profile.rating = Math.round((((profile.rating ?? 5) * count + 5) / (count + 1)) * 10) / 10
    profile.rating_count = count + 1
    profile.deals_count = (profile.deals_count ?? 0) + 1
  }
  const farmer = findProfile(tx.farmer_id)
  const reseller = findProfile(tx.reseller_id)
  bump(farmer)
  bump(reseller)

  // MOCK: olib sotuvchiga bonus (mantiq hali loyihalanmagan).
  tx.bonus = Math.round(tx.total * BONUS_RATE)
  if (reseller) reseller.bonus_points = (reseller.bonus_points ?? 0) + tx.bonus
}

/**
 * MOCK: keyingi bosqichni bajaradi.
 * `stepKey` — kutilayotgan bosqich (interfeys va baza mos kelishi uchun).
 */
export function advanceTransaction(id, stepKey, payload = {}) {
  return delay(() => {
    const tx = find(id)
    if (!tx || tx.status === 'done') return decorate(tx)

    const current = STEP_KEYS[tx.step]
    if (stepKey && stepKey !== current) return decorate(tx)

    if (current === 'receipt') {
      // MOCK: tarozi cheki tekshirildi.
      tx.receipt = {
        number: payload.number ?? null,
        photo_name: payload.photoName ?? null,
        verified: true,
        verified_at: nowIso(),
      }
    }

    tx.history.push({ step: current, at: nowIso() })
    tx.step += 1
    tx.updated_at = nowIso()

    // 'escrow' va 'payout' — tizim bosqichlari: ular darhol o'tadi.
    if (STEP_KEYS[tx.step] === 'escrow') {
      tx.history.push({ step: 'escrow', at: nowIso() })
      tx.step += 1
      tx.escrow_held = true
    }

    if (tx.step >= STEP_KEYS.length - 1 && STEP_KEYS[tx.step] === 'payout') {
      tx.history.push({ step: 'payout', at: nowIso() })
      tx.step = STEP_KEYS.length
      tx.payout_released = true
      complete(tx)
    }

    save()
    return decorate(tx)
  }, stepKey === 'pay' || stepKey === 'received' ? LONG : NORMAL)
}

/** MOCK: tarozi chekini yuborish (raqam yoki rasm) — doim tasdiqlanadi. */
export function submitWeighbridgeReceipt(id, { number, photoName }) {
  return advanceTransaction(id, 'receipt', { number, photoName })
}
