/**
 * localStorage kalitlari AGROGRAM nomiga o'tkazildi.
 * Eski `agro_auksion_*` kalitlari bir marta ko'chiriladi — shunda mavjud
 * foydalanuvchilar tizimdan chiqib ketmaydi va sozlamalari saqlanadi.
 */

import log from './logger.js'

export const KEYS = {
  token: 'agrogram_token',
  theme: 'agrogram_theme',
  lang: 'agrogram_lang',
}

const LEGACY = {
  [KEYS.token]: 'agro_auksion_token',
  [KEYS.theme]: 'agro_auksion_theme',
  [KEYS.lang]: 'agro_auksion_lang',
}

/** Eski kalitlar — chiqishda ular ham tozalanadi. */
export const LEGACY_KEYS = [...Object.values(LEGACY), 'agro_auksion_profile_id']

export function readStored(key) {
  try {
    const value = localStorage.getItem(key)
    if (value !== null) return value

    // Bir martalik ko'chirish: eski kalitdan yangisiga.
    const legacy = LEGACY[key]
    if (!legacy) return null
    const old = localStorage.getItem(legacy)
    if (old === null) return null
    localStorage.setItem(key, old)
    localStorage.removeItem(legacy)
    log.store(`Eski kalit ko'chirildi: ${legacy} -> ${key}`)
    return old
  } catch {
    // localStorage o'chirilgan bo'lishi mumkin (maxfiy rejim).
    return null
  }
}

export function writeStored(key, value) {
  try {
    localStorage.setItem(key, value)
    log.store(`Saqlandi: ${key}`)
  } catch (err) {
    log.store.error(`Saqlab bo'lmadi: ${key}`, err)
  }
}

export function removeStored(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* e'tiborsiz */
  }
}
