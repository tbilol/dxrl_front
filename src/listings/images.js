import { useSyncExternalStore } from 'react'

/**
 * E'lon rasmlari.
 *
 * TODO: Upload listing images to backend — serverda `auctions` jadvalida
 * rasm maydoni yo'q va fayl saqlash endpointi ham yo'q. Shuning uchun
 * tanlangan rasmlar hozircha FAQAT joriy sessiyada, brauzer xotirasida
 * saqlanadi: sahifa yangilansa yo'qoladi va boshqa foydalanuvchilar
 * ularni ko'rmaydi.
 *
 * Backendda `POST /api/auctions/{id}/images` (multipart) paydo bo'lgach
 * `uploadImages()` chaqiriladi va API javobidagi `images` maydoni shu
 * modul o'rnini egallaydi — komponentlar o'zgarishsiz qoladi.
 */

export const MAX_IMAGES = 5
export const MAX_BYTES = 5 * 1024 * 1024
export const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/** listingId → [{ id, url, file }] */
const store = new Map()
let version = 0
const listeners = new Set()

function emit() {
  version += 1
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Komponentlar shu hook orqali o'zgarishlarni kuzatadi. */
export function useListingImages() {
  useSyncExternalStore(subscribe, () => version, () => version)
  return store
}

/** Serverdan kelgan rasmlar bo'lsa ular ustun, aks holda sessiya keshidan. */
export function imagesOf(item) {
  if (Array.isArray(item?.images) && item.images.length) return item.images
  return store.get(item?.id) ?? []
}

export function setImages(listingId, images) {
  if (!listingId) return
  if (images.length) store.set(listingId, images)
  else store.delete(listingId)
  emit()
}

/** Vaqtinchalik ID dan server bergan ID ga ko'chirish. */
export function moveImages(fromId, toId) {
  const imgs = store.get(fromId)
  if (!imgs) return
  store.delete(fromId)
  store.set(toId, imgs)
  emit()
}

/** Tanlangan faylni tekshiradi. Xato bo'lsa kalit qaytaradi, aks holda null. */
export function validateImage(file) {
  if (!ALLOWED.includes(file.type)) return 'listing.imageTypeError'
  if (file.size > MAX_BYTES) return 'listing.imageSizeError'
  return null
}

/** Fayldan darhol ko'rsatiladigan yozuv yasaydi. */
export function makeImage(file) {
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    url: URL.createObjectURL(file),
    file,
  }
}

export function releaseImage(image) {
  if (image?.url?.startsWith('blob:')) URL.revokeObjectURL(image.url)
}
