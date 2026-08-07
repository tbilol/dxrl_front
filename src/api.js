import axios from 'axios'
import { clearToken, getToken } from './auth.js'

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
  return config
})

// Token eskirgan bo'lsa — uni tozalaymiz, foydalanuvchi qayta kiradi.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) clearToken()
    return Promise.reject(error)
  },
)

/* ---------------------------- Autentifikatsiya --------------------------- */

/** Google ruxsat oynasiga o'tish manzili (to'liq sahifa yo'naltirish uchun). */
export const GOOGLE_LOGIN_URL = `${API_BASE_URL}/api/auth/google/login`

export const getMe = () => api.get('/api/auth/me').then((r) => r.data)

/* ------------------------------ Auksionlar ------------------------------ */

export const getAuctions = (params) =>
  api.get('/api/auctions', { params }).then((r) => r.data)
export const getAuction = (id) => api.get(`/api/auctions/${id}`).then((r) => r.data)
export const createAuction = (data) => api.post('/api/auctions', data).then((r) => r.data)
export const updateAuction = (id, data) => api.put(`/api/auctions/${id}`, data).then((r) => r.data)
export const deleteAuction = (id) => api.delete(`/api/auctions/${id}`).then((r) => r.data)

/* ------------------------------- So'rovlar ------------------------------ */

export const getRequests = (params) =>
  api.get('/api/requests', { params }).then((r) => r.data)
export const getRequest = (id) => api.get(`/api/requests/${id}`).then((r) => r.data)
export const createRequest = (data) => api.post('/api/requests', data).then((r) => r.data)
export const updateRequest = (id, data) => api.put(`/api/requests/${id}`, data).then((r) => r.data)
export const deleteRequest = (id) => api.delete(`/api/requests/${id}`).then((r) => r.data)

/* ------------------------------ Statistika ------------------------------ */

export const getTopAuctions = () => api.get('/api/stats/top-auctions').then((r) => r.data)
export const getTopRequests = () => api.get('/api/stats/top-requests').then((r) => r.data)
export const getStatsSummary = () => api.get('/api/stats/summary').then((r) => r.data)

/* -------------------------------- Profil -------------------------------- */

export const getProfiles = () => api.get('/api/profiles').then((r) => r.data)
export const getProfile = (id) => api.get(`/api/profiles/${id}`).then((r) => r.data)
export const createProfile = (data) => api.post('/api/profiles', data).then((r) => r.data)
export const updateProfile = (id, data) => api.put(`/api/profiles/${id}`, data).then((r) => r.data)
export const deleteProfile = (id) => api.delete(`/api/profiles/${id}`).then((r) => r.data)

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
    return t ? t('auth.sessionExpired') : 'Sessiya tugadi. Google orqali qaytadan kiring.'
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
