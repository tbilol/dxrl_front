/**
 * Xatoni foydalanuvchi tiliga aylantiradi.
 * `t` — i18n tarjima funksiyasi (useT()).
 *
 * Mock qatlam ham, kelajakdagi HTTP qatlam ham bir xil shakldagi xatolik
 * beradi (`err.response.data.detail`), shuning uchun bu funksiya ikkalasi
 * uchun ham ishlaydi.
 */
export function errorMessage(err, t) {
  const detail = err?.response?.data?.detail

  if (err?.response?.status === 401) {
    return t ? t('auth.sessionExpired') : 'Sessiya tugadi. Qaytadan kiring.'
  }
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) return detail.map((d) => d.msg).join(', ')
  if (err?.code === 'ERR_NETWORK') {
    return t ? t('common.networkError') : "Serverga ulanib bo'lmadi."
  }
  return t ? t('common.error') : 'Xatolik yuz berdi.'
}

export default errorMessage
