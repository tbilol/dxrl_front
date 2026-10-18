import { useSyncExternalStore } from 'react'

import { KEYS, readStored, writeStored } from '../storage.js'

/**
 * Saqlangan e'lonlar.
 *
 * Ular qurilmada (localStorage) saqlanadi — bu haqiqatan ishlaydi, lekin
 * faqat shu brauzerda. Kalit — `kind:id` (masalan `offer:42`): taklif va
 * so'rov ID lari backendda bir-biriga to'g'ri kelib qolishi mumkin.
 * TODO: Connect to backend — serverda sevimlilar jadvali paydo bo'lgach,
 * ro'yxat profil bilan birga sinxronlanadi.
 */

function read() {
  try {
    const raw = readStored(KEYS.favorites)
    const list = raw ? JSON.parse(raw) : []
    // Eski formatdagi (turisiz) yozuvlar tashlab yuboriladi.
    return Array.isArray(list)
      ? list.filter((key) => typeof key === 'string' && /^(offer|request):/.test(key))
      : []
  } catch {
    return []
  }
}

let ids = new Set(read())
let snapshot = [...ids].join(',')
const listeners = new Set()

function emit() {
  snapshot = [...ids].join(',')
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useFavorites() {
  useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
  return ids
}

/** `kind` — 'offer' yoki 'request'. */
export function favoriteKey(kind, id) {
  return `${kind}:${id}`
}

export function isFavorite(kind, id) {
  return ids.has(favoriteKey(kind, id))
}

export function toggleFavorite(kind, id) {
  if (!id) return
  const key = favoriteKey(kind, id)
  if (ids.has(key)) ids.delete(key)
  else ids.add(key)
  writeStored(KEYS.favorites, JSON.stringify([...ids]))
  emit()
}
