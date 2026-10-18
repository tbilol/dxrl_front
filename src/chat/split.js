import { useCallback, useEffect, useRef, useState } from 'react'

import { KEYS, readStored, writeStored } from '../storage.js'

/**
 * Desktopdagi ikki panelli maketning ajratgichi (Telegramdagidek).
 *
 * Uchta tayanch holat bor; ajratgichni ikki marta bosish ular orasida
 * aylantiradi. Sichqoncha bilan istalgan kenglikka ham sudrash mumkin —
 * natija localStorage da saqlanadi.
 */

/**
 * Tayanch holatlar.
 *
 * 1-rejim piksel bilan beriladi, ulush bilan emas: "faqat avatarlar"
 * degani tor tasma degani, keng ekranda 20% esa 280px dan oshib ketardi
 * va yonida bo'sh joy qolardi.
 */
export const MODES = [
  { id: 'narrow', px: 76 },
  { id: 'balanced', ratio: 0.35 },
  { id: 'wide', ratio: 0.5 },
]

function widthOf(mode, total) {
  return mode.px ?? Math.round(total * mode.ratio)
}

/** Panel eng kam kengliklari (px). */
export const MIN_LIST = 60
export const MIN_CHAT = 300

/** Shu kenglikdan tor bo'lsa ro'yxat faqat avatarlarni ko'rsatadi. */
export const AVATARS_ONLY_BELOW = 150

/** Ajratgich kengligi (CSS dagi `grid-template-columns` bilan bir xil). */
const BAR_W = 5

function clampWidth(px, total) {
  return Math.max(MIN_LIST, Math.min(px, total - MIN_CHAT - BAR_W))
}

export default function useSplit(containerRef) {
  const [width, setWidth] = useState(() => {
    const saved = Number(readStored(KEYS.chatSplit))
    return Number.isFinite(saved) && saved > 0 ? saved : 0
  })
  const [dragging, setDragging] = useState(false)
  const modeRef = useRef(1)

  /** Konteyner o'lchami ma'lum bo'lgach boshlang'ich kenglikni hisoblaymiz. */
  useEffect(() => {
    if (width > 0) return
    const total = containerRef.current?.clientWidth
    if (!total) return
    setWidth(clampWidth(widthOf(MODES[1], total), total))
  }, [width, containerRef])

  // Oyna o'lchami o'zgarsa kenglik chegaralarda qoladi.
  useEffect(() => {
    const onResize = () => {
      const total = containerRef.current?.clientWidth
      if (!total) return
      setWidth((w) => (w > 0 ? clampWidth(w, total) : w))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [containerRef])

  const save = useCallback((px) => {
    writeStored(KEYS.chatSplit, String(Math.round(px)))
  }, [])

  /* --------------------------- Sudrash --------------------------- */

  const startDrag = useCallback(
    (event) => {
      event.preventDefault()
      const box = containerRef.current?.getBoundingClientRect()
      if (!box) return
      setDragging(true)

      const move = (e) => {
        const next = clampWidth(e.clientX - box.left, box.width)
        setWidth(next)
      }
      const up = (e) => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        setDragging(false)
        save(clampWidth(e.clientX - box.left, box.width))
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [containerRef, save],
  )

  /** Ikki marta bosilsa — keyingi tayanch holatga. */
  const cycleMode = useCallback(() => {
    const total = containerRef.current?.clientWidth
    if (!total) return
    modeRef.current = (modeRef.current + 1) % MODES.length
    const next = clampWidth(widthOf(MODES[modeRef.current], total), total)
    setWidth(next)
    save(next)
  }, [containerRef, save])

  return { width, dragging, startDrag, cycleMode, avatarsOnly: width > 0 && width < AVATARS_ONLY_BELOW }
}
