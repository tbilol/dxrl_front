/**
 * MOCK: super kalkulyator hisob-kitobi (hamma uchun bepul).
 */

import { findProduct } from '../../data/products.js'
import { delay, NORMAL, trace } from './util.js'

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

