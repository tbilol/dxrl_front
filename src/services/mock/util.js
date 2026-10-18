/**
 * MOCK: Yordamchi funksiyalar — soxta tarmoq kechikishi, ID va tasodif.
 *
 * Hamma mock funksiya shu yerdagi `delay()` orqali javob qaytaradi: interfeys
 * yuklanish holatini ko'rsatadi, so'ng muvaffaqiyat keladi. Backend ulanganda
 * bu fayl butunlay olib tashlanadi.
 */

import log from '../../logger.js'

/** Standart "tarmoq" kechikishi (ms). */
export const SHORT = 350
export const NORMAL = 650
export const LONG = 1100

/** MOCK: har qanday qiymatni kechikish bilan qaytaradi. */
export function delay(value, ms = NORMAL) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(typeof value === 'function' ? value() : value), ms)
  })
}

/** MOCK: soxta xatolik (hozircha hech qayerda ishlatilmaydi — hamma oqim muvaffaqiyatli). */
export function fail(message, ms = SHORT) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(Object.assign(new Error(message), { mock: true })), ms)
  })
}

let counter = 0

export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

export function nowIso() {
  // Backend UTC ni zona belgisisiz yuboradi — utils.js dagi parseDate shunga mo'ljallangan.
  return new Date().toISOString().replace('Z', '')
}

export function isoDaysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString().replace('Z', '')
}

/** Urug'langan tasodifiy sonlar (mulberry32) — har ishga tushishda bir xil ma'lumot. */
export function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const pick = (rand, list) => list[Math.floor(rand() * list.length)]

export const round1 = (n) => Math.round(n * 10) / 10

/** MOCK chaqiruvlarini konsolda ko'rish uchun (AGROGRAM_DEBUG yoqilganda). */
export function trace(name, payload) {
  log.api(`MOCK ${name}`, payload ?? '')
}
