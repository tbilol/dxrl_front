/** JWT tokenni localStorage'da saqlash va o'qish uchun yordamchilar. */

import log from './logger.js'
import { KEYS, LEGACY_KEYS, readStored, removeStored, writeStored } from './storage.js'

const TOKEN_KEY = KEYS.token

/** JWT'ning payload qismini o'qiydi (imzo tekshirilmaydi — buni backend qiladi). */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function isExpired(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

export function getToken() {
  const token = readStored(TOKEN_KEY)
  if (!token) return null
  if (isExpired(token)) {
    log.auth('Token muddati tugagan')
    clearToken()
    return null
  }
  return token
}

export function setToken(token) {
  writeStored(TOKEN_KEY, token)
  // Tokenning o'zi hech qachon logga yozilmaydi — faqat kimga tegishli ekani.
  log.auth('Token saqlandi', { userId: decodeToken(token)?.sub })
  log.store('Token localStorage ga yozildi')
}

export function clearToken() {
  removeStored(TOKEN_KEY)
  LEGACY_KEYS.forEach(removeStored)
  log.auth('Chiqish — token o\'chirildi')
}

export function isLoggedIn() {
  return Boolean(getToken())
}

/**
 * Google callback bizni `?token=...` bilan qaytaradi.
 * React render bo'lishidan oldin (main.jsx) chaqiriladi: token saqlanadi va
 * manzil qatoridan olib tashlanadi.
 */
export function consumeTokenFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  if (!token) return

  log.auth('OAuth qaytdi — URL dan token olindi')
  setToken(token)
  params.delete('token')
  const query = params.toString()
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )
}
