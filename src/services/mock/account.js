/**
 * MOCK: hisob bilan bog'liq amallar — e-ijara tasdig'i, Premium tarif va
 * super kalkulyator hisob-kitobi.
 */

import { findProduct } from '../../data/products.js'
import { PLANS } from '../../plans.js'
import { currentProfile, publicProfile, save } from './db.js'
import { delay, LONG, NORMAL, nowIso, trace } from './util.js'

/* ---------------------- E-ijara (dehqon tasdig'i) ------------------------ */

/**
 * MOCK: yer ijarasi shartnoma raqamini tekshirish.
 * Haqiqiy tizimda bu e-ijara xizmatiga so'rov bo'ladi; hozircha raqam
 * kiritilsa — hisob "tasdiqlangan dehqon" bo'ladi.
 */
export function verifyFarmer(contractNumber) {
  trace('verifyFarmer', { contractNumber })
  return delay(() => {
    const me = currentProfile()
    me.is_verified_farmer = true
    me.lease_contract = String(contractNumber ?? '').trim()
    me.verified_at = nowIso()
    save()
    return { verified: true, profile: publicProfile(me) }
  }, LONG)
}

/* ------------------------------- Premium --------------------------------- */

/**
 * MOCK: Premium sotib olish. To'lov tizimi ulanmagan — spinner, so'ng
 * muvaffaqiyat va hisob premiumga o'tadi.
 */
export function purchasePremium(planId = 'premium') {
  trace('purchasePremium', { planId })
  return delay(() => {
    const me = currentProfile()
    me.is_premium = planId === 'premium'
    me.premium_since = nowIso()
    save()
    return { ok: true, plan: PLANS[planId] ?? PLANS.premium, profile: publicProfile(me) }
  }, LONG)
}

/** MOCK: Premiumni bekor qilish (sinov uchun). */
export function cancelPremium() {
  return delay(() => {
    const me = currentProfile()
    me.is_premium = false
    save()
    return { ok: true, profile: publicProfile(me) }
  }, NORMAL)
}

/* --------------------------- Super kalkulyator --------------------------- */

/**
 * MOCK: hosil bashorati.
 *
 * Hisob oddiy: gektariga o'rtacha hosil × maydon, keyin urug' me'yoriga
 * nisbati bilan tuzatiladi (kam urug' — kam hosil, ortiqchasi esa hosilni
 * cheksiz oshirmaydi). Haqiqiy model backendda (tuproq, sug'orish, ob-havo)
 * hisoblanadi.
 */
export function estimateYield({ crop, areaHa, seedKg }) {
  trace('estimateYield', { crop, areaHa, seedKg })
  return delay(() => {
    // Me'yorlar src/data/products.js dagi ekin yozuvidan olinadi.
    const spec = findProduct(crop)?.crop ?? { yieldPerHa: 5, seedPerHa: 200 }
    const area = Math.max(Number(areaHa) || 0, 0)
    const seed = Math.max(Number(seedKg) || 0, 0)

    const expectedSeed = spec.seedPerHa * area
    // Urug' me'yordan kam bo'lsa hosil proportsional kamayadi; ko'p bo'lsa
    // foyda tez to'yinadi (kvadrat ildiz).
    const ratio = expectedSeed > 0 ? seed / expectedSeed : 1
    const factor = ratio >= 1 ? 1 + Math.sqrt(ratio - 1) * 0.12 : Math.max(ratio, 0.15)

    const tons = spec.yieldPerHa * area * factor
    return {
      crop,
      areaHa: area,
      seedKg: seed,
      expectedSeedKg: Math.round(expectedSeed * 10) / 10,
      tons: Math.round(tons * 10) / 10,
      // Ishonch oralig'i: ±10% (interfeysda "≈80–90% aniqlik" deb ko'rsatiladi).
      minTons: Math.round(tons * 0.9 * 10) / 10,
      maxTons: Math.round(tons * 1.1 * 10) / 10,
      perHa: spec.yieldPerHa,
    }
  }, NORMAL)
}

