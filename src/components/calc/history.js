/**
 * Kalkulyator tarixi — oddiy hisob va hosil bashorati uchun bitta modul.
 *
 * Yozuvlar localStorage da saqlanadi (qurilmada qoladi, serverga
 * yuborilmaydi), yangisi doim birinchi turadi va ro'yxat LIMIT ta yozuv
 * bilan cheklanadi — aks holda saqlash kaliti cheksiz o'sib ketardi.
 */

import { useCallback, useState } from 'react'
import log from '../../logger.js'
import { readStored, removeStored, writeStored } from '../../storage.js'

/** Saqlanadigan eng ko'p yozuv soni. */
export const LIMIT = 25

function read(key) {
  const raw = readStored(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, LIMIT) : []
  } catch {
    // Buzilgan qiymat — bo'sh tarixdan boshlaymiz.
    return []
  }
}

/**
 * `key` — storage.js dagi KEYS qiymati (har bir kalkulyatorda o'ziniki).
 * Qaytaradi: { items, add(entry), clear() }.
 */
export default function useCalcHistory(key) {
  const [items, setItems] = useState(() => read(key))

  /*
   * Yozish setState updateri ICHIDA emas: saqlash — nojo'ya ta'sir, updater
   * esa toza bo'lishi kerak (StrictMode uni ikki marta chaqiradi).
   */
  const add = useCallback(
    (entry) => {
      const record = { id: `${Date.now()}-${items.length}`, at: new Date().toISOString(), ...entry }
      const next = [record, ...items].slice(0, LIMIT)
      writeStored(key, JSON.stringify(next))
      setItems(next)
      log.store('Hisob tarixiga yozildi', key)
    },
    [items, key],
  )

  const clear = useCallback(() => {
    setItems([])
    removeStored(key)
    log.store('Hisob tarixi tozalandi', key)
  }, [key])

  return { items, add, clear }
}
