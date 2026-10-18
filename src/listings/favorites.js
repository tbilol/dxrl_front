import { useSyncExternalStore } from 'react'

import { KEYS, readStored, writeStored } from '../storage.js'

/**
 * Saqlangan e'lonlar.
 *
 * Ular qurilmada (localStorage) saqlanadi — bu haqiqatan ishlaydi, lekin
 * faqat shu brauzerda.
 * TODO: Connect to backend — serverda sevimlilar jadvali paydo bo'lgach,
 * ro'yxat profil bilan birga sinxronlanadi.
 */

function read() {
  try {
    const raw = readStored(KEYS.favorites)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((id) => typeof id === 'string') : []
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

export function isFavorite(id) {
  return ids.has(id)
}

export function toggleFavorite(id) {
  if (!id) return
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  writeStored(KEYS.favorites, JSON.stringify([...ids]))
  emit()
}
