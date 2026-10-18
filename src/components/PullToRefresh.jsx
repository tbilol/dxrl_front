import { useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { RefreshIcon } from './Icons.jsx'
import { scrollTop } from '../scroller.js'

const THRESHOLD = 72
const MAX_PULL = 100

/**
 * Mobil ilovadagidek "tortib yangilash" hissi.
 * Sahifa tepasida turib pastga tortilsa — kontent egiladi va qo'yib
 * yuborilganda onRefresh() chaqiriladi.
 *
 * Ko'rsatkich kontent ustida alohida qatlamda turadi va tortilganda kontent
 * siljib uni ochadi. Ilgari ko'rsatkichning `height` xususiyati animatsiya
 * qilinardi: har bir barmoq harakatida butun sahifa qaytadan joylashib,
 * tortish sezilarli darajada sekinlashardi. Endi barcha harakat faqat
 * `transform` va `opacity` orqali — kompozitor qatlamida.
 */
export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const y = useMotionValue(0)
  const [busy, setBusy] = useState(false)
  const startRef = useRef(null)

  const rotate = useTransform(y, [0, MAX_PULL], [0, 320])
  const opacity = useTransform(y, [0, THRESHOLD * 0.5], [0, 1])
  const scale = useTransform(y, [0, THRESHOLD], [0.6, 1])

  const settle = (to) =>
    animate(y, to, { type: 'spring', stiffness: 340, damping: 30, mass: 0.7 })

  const onTouchStart = (e) => {
    if (disabled || busy) return
    // Faqat sahifa eng tepasida bo'lganda tortish hisobga olinadi.
    if (scrollTop() > 2) return
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
      className="ptr-host"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <motion.div className="ptr" style={{ opacity }} aria-hidden="true">
        <motion.span className="ptr-dial" style={{ rotate, scale }}>
          {/* Yuklanish paytidagi aylanish — CSS animatsiyasi (transform). */}
          <span className={`ptr-spin${busy ? ' is-busy' : ''}`}>
            <RefreshIcon size={22} />
          </span>
        </motion.span>
      </motion.div>

      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
