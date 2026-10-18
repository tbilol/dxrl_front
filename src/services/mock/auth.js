/**
 * MOCK: autentifikatsiya — Google, iCloud (Apple) va telefon + parol.
 *
 * Hech qanday tarmoq so'rovi yo'q: tugma bosilgach qisqa kutish (spinner),
 * so'ng doim muvaffaqiyat. Token ham soxta, lekin haqiqiy JWT tuzilishida
 * (header.payload.signature) — `src/auth.js` uni o'zgarishsiz o'qiydi.
 */

import db, { createUser, currentProfile, ensureSeedConversations, publicProfile, save } from './db.js'
import { delay, LONG, NORMAL, trace } from './util.js'

const DAY = 86400

function base64url(obj) {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** MOCK: imzosi tekshirilmaydigan soxta JWT (backend kelganda haqiqiysi bo'ladi). */
function mockToken(userId) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  const payload = base64url({ sub: userId, exp: Math.floor(Date.now() / 1000) + 30 * DAY })
  return `${header}.${payload}.mock-signature`
}

function session(profile) {
  db.currentUserId = profile.id
  ensureSeedConversations(profile.id)
  save()
  return { access_token: mockToken(profile.id), profile: publicProfile(profile) }
}

/** Bir xil telefon bilan qayta kirilsa — o'sha hisob qaytariladi. */
function findByPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return db.profiles.find((p) => String(p.phone ?? '').replace(/\D/g, '') === digits) ?? null
}

/* --------------------------------- Kirish -------------------------------- */

// MOCK: Google orqali kirish. Backendda bu OAuth qayta yo'naltirish bo'ladi.
export function signInWithGoogle() {
  trace('signInWithGoogle')
  return delay(() => {
    const existing = db.profiles.find((p) => p.has_google && p.email)
    return session(existing ?? createUser({ name: 'Google foydalanuvchi', email: 'demo@gmail.com', provider: 'google' }))
  }, LONG)
}

// MOCK: iCloud (Apple) orqali kirish.
export function signInWithApple() {
  trace('signInWithApple')
  return delay(() => {
    const existing = db.profiles.find((p) => p.has_apple && p.email)
    return session(existing ?? createUser({ name: 'iCloud foydalanuvchi', email: 'demo@icloud.com', provider: 'apple' }))
  }, LONG)
}

// MOCK: telefon + parol bilan kirish (SMS tasdiqlash yo'q).
export function phoneLogin({ phone }) {
  trace('phoneLogin', { phone })
  return delay(() => {
    const existing = findByPhone(phone)
    return session(existing ?? createUser({ name: 'Yangi foydalanuvchi', phone, provider: 'phone' }))
  }, NORMAL)
}

// MOCK: telefon + parol bilan ro'yxatdan o'tish.
export function phoneRegister({ name, phone }) {
  trace('phoneRegister', { name, phone })
  return delay(() => session(findByPhone(phone) ?? createUser({ name, phone, provider: 'phone' })), NORMAL)
}

/* -------------------------------- Profilim ------------------------------- */

export function getMe() {
  const profile = currentProfile()
  // Token bor, lekin sessiya yo'q (masalan, mock baza tozalangan) —
  // 401 qaytaramiz: `src/api.js` dagi kabi token o'chiriladi.
  if (!profile) {
    const err = new Error('Sessiya topilmadi')
    err.response = { status: 401, data: { detail: 'Sessiya topilmadi' } }
    return Promise.reject(err)
  }
  return delay(() => publicProfile(profile), 120)
}

// MOCK: joriy hisobga telefon + parol qo'shish.
export function linkPhonePassword({ phone }) {
  return delay(() => {
    const me = currentProfile()
    me.phone = phone || me.phone
    me.has_password = true
    save()
    return publicProfile(me)
  }, NORMAL)
}

// MOCK: parol bilan kirishni o'chirish.
export function unlinkPhonePassword() {
  return delay(() => {
    const me = currentProfile()
    me.has_password = false
    save()
    return publicProfile(me)
  }, NORMAL)
}

/** Sessiyani yopish (chiqish) — token `src/auth.js` da tozalanadi. */
export function endSession() {
  db.currentUserId = null
  save()
}
