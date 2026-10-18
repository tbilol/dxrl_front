import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { formatNumber } from '../utils.js'

/**
 * Raqam oldingi qiymatdan yangisigacha "sanab" chiqadi (statistika kartalari).
 *
 * Har kadrda React holati emas, to'g'ridan-to'g'ri DOM matni yangilanadi.
 * Ilgari har kadr uchun setState chaqirilardi: statistika sahifasida oltita
 * shunday raqam bor — sekundiga ~360 ta render, natijada kartalar sanash
 * paytida sekinlashardi. Endi qayta render umuman bo'lmaydi.
 *
 * prefers-reduced-motion yoqilgan bo'lsa — darhol oxirgi qiymat ko'rsatiladi.
 */
export default function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  suffix = '',
  /** Ixtiyoriy: raqamni o'z ko'rinishiga o'girish (masalan "1,2 mlrd"). */
  format = null,
}) {
  const reduced = useReducedMotion()
  const target = Number(value) || 0
  const nodeRef = useRef(null)
  // Oxirgi ko'rsatilgan qiymat — keyingi sanash shu yerdan boshlanadi.
  const shownRef = useRef(reduced ? target : 0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return undefined

    const round = (n) =>
      decimals > 0 ? Math.round(n * 10 ** decimals) / 10 ** decimals : Math.round(n)

    const paint = (n) => {
      const shown = round(n)
      node.textContent = `${format ? format(shown) : formatNumber(shown)}${suffix}`
    }

    if (reduced || duration <= 0) {
      shownRef.current = target
      paint(target)
      return undefined
    }

    const from = shownRef.current
    if (from === target) {
      paint(target)
      return undefined
    }

    const start = performance.now()
    let frame

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      // easeOutCubic — oxiriga borib sekinlashadi.
      const eased = 1 - (1 - p) ** 3
      const current = from + (target - from) * eased
      shownRef.current = current
      paint(current)
      if (p < 1) frame = requestAnimationFrame(tick)
      else shownRef.current = target
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, decimals, suffix, format, reduced])

  // Boshlang'ich matn serverdan kelgan holatga mos bo'lishi uchun shu yerda ham
  // yoziladi — effekt ishga tushgunicha katak bo'sh turmaydi.
  const first = reduced ? target : 0
  return (
    <span className="num" ref={nodeRef}>
      {format ? format(first) : formatNumber(first)}
      {suffix}
    </span>
  )
}
