import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import log from './logger.js'
import { KEYS, readStored, writeStored } from './storage.js'

/**
 * Bildirishnoma va maxfiylik sozlamalari.
 *
 * Mavzu (theme.jsx) va til (i18n) alohida saqlanadi — ular renderdan oldin
 * kerak bo'ladi. Qolgan hamma narsa shu yerda, bitta JSON kalitida.
 *
 * TODO: Connect to backend API — hozircha sozlamalar faqat shu qurilmada
 * saqlanadi; server tomonida profil sozlamalari paydo bo'lgach, ular
 * /api/auth/me javobidan o'qilib, o'zgarishlar serverga yuboriladi.
 */

const STORAGE_KEY = KEYS.settings

export const DEFAULT_SETTINGS = {
  /* Bildirishnomalar */
  pushEnabled: true,
  notifyMessages: true,
  notifyOffers: true,
  notifyRequests: true,
  notifyPrices: false,

  /* Maxfiylik */
  profileVisibility: 'everyone', // 'everyone' | 'members'
  showPhone: true,
  showLocation: true,
  showOnline: true,
}

const SettingsContext = createContext(null)

function readSaved() {
  const raw = readStored(STORAGE_KEY)
  if (!raw) return DEFAULT_SETTINGS
  try {
    const saved = JSON.parse(raw)
    // Faqat tanish kalitlar olinadi — eski yoki buzilgan qiymatlar tushib qoladi.
    const merged = { ...DEFAULT_SETTINGS }
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (key in saved && typeof saved[key] === typeof DEFAULT_SETTINGS[key]) {
        merged[key] = saved[key]
      }
    }
    return merged
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSaved)

  useEffect(() => {
    writeStored(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  /** set('showPhone', false) — bitta sozlamani yangilaydi. */
  const set = useCallback((key, value) => {
    if (!(key in DEFAULT_SETTINGS)) return
    setSettings((prev) => {
      if (prev[key] === value) return prev
      log.store(`Sozlama o'zgardi: ${key}`, value)
      return { ...prev, [key]: value }
    })
  }, [])

  /** toggle('showPhone') — mantiqiy sozlamani teskarisiga o'giradi. */
  const toggle = useCallback((key) => {
    setSettings((prev) => {
      if (typeof prev[key] !== 'boolean') return prev
      log.store(`Sozlama o'zgardi: ${key}`, !prev[key])
      return { ...prev, [key]: !prev[key] }
    })
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  const value = useMemo(() => ({ settings, set, toggle, reset }), [settings, set, toggle, reset])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useAppSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useAppSettings() faqat <SettingsProvider> ichida ishlaydi')
  return ctx
}
