import { startTransition, useEffect, useMemo, useState } from 'react'

/**
 * Uzun ro'yxatni bo'lak-bo'lak chizadi.
 *
 * Nima uchun. Bir vaqtning o'zida 300 ta kartani mount qilish asosiy oqimni
 * ~130ms band qiladi — bosishdan keyingi "qotib qolish" aynan shu. Bu yerda
 * birinchi bo'lak darhol chiziladi, qolganlari esa brauzer bo'sh turganda,
 * past ustuvorlikdagi yangilanishlar bilan qo'shiladi. Foydalanuvchi uchun
 * sahifa darhol ochiladi, ro'yxat esa to'liq qoladi.
 *
 * Nima uchun react-window emas. Kartalar moslashuvchan CSS to'rda turadi
 * (mobilda 2, kengda 3 ustun) va balandligi kontentga qarab har xil —
 * oynali ro'yxat esa qat'iy o'lchamni talab qiladi. To'rni buzmasdan
 * birinchi chizishdagi yukni cheklash shu yerda ancha mos yechim.
 * Ekrandan tashqaridagi kartalarning maketi va bo'yashi CSS dagi
 * `content-visibility: auto` bilan baribir o'tkazib yuboriladi.
 */

const FIRST_CHUNK = 24
/* 64 ta karta ~25ms da chiziladi — kadr byudjetidan chiqmaydi,
   lekin uzun ro'yxat bir necha qadamda to'liq to'ldiriladi. */
const NEXT_CHUNK = 64

export default function useIncrementalList(items) {
  const total = items ? items.length : 0
  const [limit, setLimit] = useState(FIRST_CHUNK)

  // Ro'yxat almashsa (boshqa bo'lim, yangi qidiruv) — boshidan.
  useEffect(() => {
    setLimit(FIRST_CHUNK)
  }, [items])

  useEffect(() => {
    if (limit >= total) return undefined

    const idle =
      window.requestIdleCallback || ((cb) => window.setTimeout(cb, 32))
    const cancel = window.cancelIdleCallback || window.clearTimeout

    const handle = idle(() => {
      startTransition(() => setLimit((prev) => prev + NEXT_CHUNK))
    })
    return () => cancel(handle)
  }, [limit, total])

  // Ro'yxat qisqa bo'lsa hech narsa kesilmaydi — havola ham o'zgarmaydi.
  return useMemo(
    () => (items && limit < items.length ? items.slice(0, limit) : items),
    [items, limit],
  )
}
