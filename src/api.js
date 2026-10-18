import axios from 'axios'
import { clearToken, getToken } from './auth.js'
import log from './logger.js'

export const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Himoyalangan endpointlar (POST/PUT/DELETE) uchun JWT tokenni qo'shamiz.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Javob kelganda davomiylikni hisoblash uchun.
  config.meta = { started: performance.now() }
  const method = (config.method || 'get').toUpperCase()
  log.api(`${method} ${config.url}`, config.params ?? '')
  return config
})

// Token eskirgan bo'lsa — uni tozalaymiz, foydalanuvchi qayta kiradi.
api.interceptors.response.use(
  (response) => {
    const ms = Math.round(performance.now() - (response.config.meta?.started ?? 0))
    const size = Array.isArray(response.data) ? `${response.data.length} ta` : ''
    log.api(`Javob ${response.status} · ${ms}ms ${size}`, response.data)
    return response
  },
  (error) => {
    const cfg = error?.config
    const method = (cfg?.method || 'get').toUpperCase()
    const status = error?.response?.status

    if (status === 401) {
      log.auth('Token yaroqsiz — tozalanmoqda')
      clearToken()
    }

    const ms = Math.round(performance.now() - (cfg?.meta?.started ?? 0))
    log.api.error('So\'rov muvaffaqiyatsiz', {
      url: cfg?.url,
      method,
      status: status ?? error?.code ?? 'network',
      ms,
      detail: error?.response?.data?.detail,
      error,
    })
    return Promise.reject(error)
  },
)

/* ---------------------------- Autentifikatsiya --------------------------- */

/** OAuth ruxsat oynalariga o'tish manzillari (to'liq sahifa yo'naltirish uchun). */
export const GOOGLE_LOGIN_URL = `${API_BASE_URL}/api/auth/google/login`
export const APPLE_LOGIN_URL = `${API_BASE_URL}/api/auth/apple/login`

export const getMe = () => api.get('/api/auth/me').then((r) => r.data)

/** Telefon + parol: ro'yxatdan o'tish. { access_token, profile } qaytaradi. */
export const phoneRegister = (data) =>
  api.post('/api/auth/phone/register', data).then((r) => r.data)

/** Telefon + parol: kirish. { access_token, profile } qaytaradi. */
export const phoneLogin = (data) => api.post('/api/auth/phone/login', data).then((r) => r.data)

/** Joriy profilga telefon + parol qo'shish (token talab qilinadi). */
export const linkPhonePassword = (data) =>
  api.post('/api/auth/phone/link', data).then((r) => r.data)

/** Parol bilan kirishni o'chirish. */
export const unlinkPhonePassword = () =>
  api.delete('/api/auth/phone/link').then((r) => r.data)

/* -------------------------------- Takliflar ------------------------------ */

/*
 * Backend yo'llari o'zgarmadi — ular shu yerda bir joyga yig'ilgan.
 * Interfeys bo'yicha bu ma'lumot "taklif" (offer) deb ataladi.
 */
const OFFERS_PATH = '/api/auctions'

export const getOffers = (params) => api.get(OFFERS_PATH, { params }).then((r) => r.data)
export const getOffer = (id) => api.get(`${OFFERS_PATH}/${id}`).then((r) => r.data)
export const createOffer = (data) => api.post(OFFERS_PATH, data).then((r) => r.data)
export const updateOffer = (id, data) => api.put(`${OFFERS_PATH}/${id}`, data).then((r) => r.data)
export const deleteOffer = (id) => api.delete(`${OFFERS_PATH}/${id}`).then((r) => r.data)

/**
 * E'lon rasmlarini yuklash.
 *
 * TODO: Upload listing images to backend — serverda hozircha bunday
 * endpoint yo'q (`auctions` jadvalida rasm maydoni ham yo'q). U paydo
 * bo'lishi bilan bu funksiya o'zgarishsiz ishlay boshlaydi.
 */
export const uploadListingImages = (id, files) => {
  const body = new FormData()
  files.forEach((file) => body.append('images', file))
  return api
    .post(`${OFFERS_PATH}/${id}/images`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

/* ------------------------------- So'rovlar ------------------------------ */

export const getRequests = (params) =>
  api.get('/api/requests', { params }).then((r) => r.data)
export const getRequest = (id) => api.get(`/api/requests/${id}`).then((r) => r.data)
export const createRequest = (data) => api.post('/api/requests', data).then((r) => r.data)
export const updateRequest = (id, data) => api.put(`/api/requests/${id}`, data).then((r) => r.data)
export const deleteRequest = (id) => api.delete(`/api/requests/${id}`).then((r) => r.data)

/* ------------------------------ Statistika ------------------------------ */

/** Backend yo'li o'zgarmadi (yuqoridagi OFFERS_PATH bilan bir xil manba). */
export const getTopOffers = () => api.get('/api/stats/top-auctions').then((r) => r.data)
export const getTopRequests = () => api.get('/api/stats/top-requests').then((r) => r.data)

/** Backend maydonlari interfeys atamalariga o'giriladi. */
export const getStatsSummary = () =>
  api.get('/api/stats/summary').then((r) => ({
    offers_count: r.data?.auctions_count ?? 0,
    requests_count: r.data?.requests_count ?? 0,
  }))

/* -------------------------------- Profil -------------------------------- */

export const getProfiles = () => api.get('/api/profiles').then((r) => r.data)
export const getProfile = (id) => api.get(`/api/profiles/${id}`).then((r) => r.data)
export const createProfile = (data) => api.post('/api/profiles', data).then((r) => r.data)
export const updateProfile = (id, data) => api.put(`/api/profiles/${id}`, data).then((r) => r.data)
export const deleteProfile = (id) => api.delete(`/api/profiles/${id}`).then((r) => r.data)

/**
 * Profil rasmini yuklash.
 *
 * TODO: Upload profile image to backend — hozircha serverda bunday endpoint
 * yo'q. `profiles.avatar_url` faqat Google/Apple orqali to'ladi va
 * `ProfileUpdate` sxemasi uni qabul qilmaydi. Server tomonida
 * `POST /api/profiles/{id}/avatar` (multipart, `avatar` maydoni) paydo
 * bo'lishi bilan bu funksiya o'zgarishsiz ishlay boshlaydi.
 */
export const uploadAvatar = (id, file) => {
  const body = new FormData()
  body.append('avatar', file)
  return api
    .post(`/api/profiles/${id}/avatar`, body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

/* --------------------------------- Obuna -------------------------------- */

/** { is_followed, followers_count } qaytaradi. */
export const followProfile = (id) =>
  api.post(`/api/profiles/${id}/follow`).then((r) => r.data)

export const unfollowProfile = (id) =>
  api.delete(`/api/profiles/${id}/follow`).then((r) => r.data)

export const getFollowers = (id) =>
  api.get(`/api/profiles/${id}/followers`).then((r) => r.data)

export const getFollowing = (id) =>
  api.get(`/api/profiles/${id}/following`).then((r) => r.data)

/* ------------------------------- Xabarlar ------------------------------- */

export const getConversations = () => api.get('/api/conversations').then((r) => r.data)

/** Suhbat bo'lsa o'shani, bo'lmasa yangisini qaytaradi. */
export const openConversation = (otherUserId) =>
  api.post('/api/conversations', { other_user_id: otherUserId }).then((r) => r.data)

export const getMessages = (conversationId, params) =>
  api.get(`/api/conversations/${conversationId}/messages`, { params }).then((r) => r.data)

export const sendMessage = (conversationId, content) =>
  api.post(`/api/conversations/${conversationId}/messages`, { content }).then((r) => r.data)

export const getUnreadCount = () =>
  api.get('/api/conversations/unread-count').then((r) => r.data.unread_count)

/* ------------------------------ Mahsulotlar ----------------------------- */

export const getProductSuggestions = (q) =>
  api.get('/api/products/suggestions', { params: { q } }).then((r) => r.data)

/* ------------------------------- Yordamchi ------------------------------ */

/**
 * Backend xatosini foydalanuvchi tiliga aylantiradi.
 * `t` — i18n tarjima funksiyasi (useT()).
 */
export function errorMessage(err, t) {
  const detail = err?.response?.data?.detail

  if (err?.response?.status === 401) {
    return t ? t('auth.sessionExpired') : 'Sessiya tugadi. Qaytadan kiring.'
  }
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => d.msg).join(', ')
  }
  if (err?.code === 'ERR_NETWORK') {
    return t
      ? t('common.networkError')
      : "Serverga ulanib bo'lmadi. Backend ishga tushganini tekshiring."
  }
  return t ? t('common.error') : 'Xatolik yuz berdi.'
}

export default api
