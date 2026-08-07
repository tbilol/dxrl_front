import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

/* ------------------------------ Auksionlar ------------------------------ */

export const getAuctions = () => api.get('/api/auctions').then((r) => r.data)
export const getAuction = (id) => api.get(`/api/auctions/${id}`).then((r) => r.data)
export const createAuction = (data) => api.post('/api/auctions', data).then((r) => r.data)
export const updateAuction = (id, data) => api.put(`/api/auctions/${id}`, data).then((r) => r.data)
export const deleteAuction = (id) => api.delete(`/api/auctions/${id}`).then((r) => r.data)

/* ------------------------------- So'rovlar ------------------------------ */

export const getRequests = () => api.get('/api/requests').then((r) => r.data)
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

/* ------------------------------- Yordamchi ------------------------------ */

/** Backend xatosini o'zbekcha matnga aylantiradi. */
export function errorMessage(err) {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => d.msg).join(', ')
  }
  if (err?.code === 'ERR_NETWORK') {
    return "Serverga ulanib bo'lmadi. Backend ishga tushganini tekshiring."
  }
  return "Xatolik yuz berdi. Qaytadan urinib ko'ring."
}

export default api
