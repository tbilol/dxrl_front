import { useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { RefreshIcon } from './Icons.jsx'

const THRESHOLD = 72
const MAX_PULL = 100

/**
 * Mobil ilovadagidek "tortib yangilash" hissi.
 * Sahifa tepasida turib pastga tortilsa — kontent egiladi va qo'yib yuborilganda
 * onRefresh() chaqiriladi.
 */
export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const y = useMotionValue(0)
  const [busy, setBusy] = useState(false)
  const startRef = useRef(null)

  const indicatorHeight = useTransform(y, (v) => Math.max(0, v))
  const rotate = useTransform(y, [0, MAX_PULL], [0, 320])
  const opacity = useTransform(y, [0, THRESHOLD * 0.5], [0, 1])
  const scale = useTransform(y, [0, THRESHOLD], [0.6, 1])

  const settle = (to) =>
    animate(y, to, { type: 'spring', stiffness: 340, damping: 30, mass: 0.7 })

  const onTouchStart = (e) => {
    if (disabled || busy) return
    // Faqat sahifa eng tepasida bo'lganda tortish hisobga olinadi.
    if (window.scrollY > 2) return
    startRef.current = e.touches[0].clientY
  }

  const onTouchMove = (e) => {
    if (startRef.current === null) return
    const delta = e.touches[0].clientY - startRef.current
    if (delta <= 0) {
      y.set(0)
      return
    }
    // Qarshilik: qancha uzoq tortilsa, shuncha "og'irlashadi".
    y.set(Math.min(delta * 0.45, MAX_PULL))
  }

  const onTouchEnd = async () => {
    const pulled = y.get()
    startRef.current = null
    if (pulled < THRESHOLD || busy) {
      settle(0)
      return
    }

    setBusy(true)
    animate(y, 54, { duration: 0.14 })
    try {
      await onRefresh()
    } finally {
      setBusy(false)
      settle(0)
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <motion.div className="ptr" style={{ height: indicatorHeight, opacity }}>
        <motion.span style={{ rotate: busy ? undefined : rotate, scale, display: 'grid' }}>
          <motion.span
            style={{ display: 'grid' }}
            animate={busy ? { rotate: 360 } : { rotate: 0 }}
            transition={busy ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
          >
            <RefreshIcon size={22} />
          </motion.span>
        </motion.span>
      </motion.div>

      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
