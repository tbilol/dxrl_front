/** JWT tokenni localStorage'da saqlash va o'qish uchun yordamchilar. */

const TOKEN_KEY = 'agro_auksion_token'
/** Google'gacha ishlatilgan eski kalit — chiqishda u ham tozalanadi. */
const LEGACY_PROFILE_KEY = 'agro_auksion_profile_id'

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
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (isExpired(token)) {
    clearToken()
    return null
  }
  return token
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LEGACY_PROFILE_KEY)
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

  setToken(token)
  params.delete('token')
  const query = params.toString()
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
  )
}
