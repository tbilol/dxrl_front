import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { PlusIcon } from './Icons.jsx'
import { onScroll, scrollTop } from '../scroller.js'

/**
 * Suzuvchi "yangi e'lon" tugmasi — pastki o'ng burchakda.
 *
 * NIMA UCHUN PORTAL. Tugma `position: fixed`. Ilgari u <PageShell> ichida
 * turardi, PageShell esa sahifa almashganda `transform` qo'llaydi. CSS
 * qoidasiga ko'ra transformlangan ota element `position: fixed` uchun yangi
 * tayanch (containing block) yaratadi: o'tish paytida tugma oynaga emas,
 * sahifa qutisiga nisbatan joylashardi va animatsiya tugagach joyiga
 * "sakrab" o'tardi — aynan shu sinuvchi harakat ko'rinardi.
 * Portal orqali <body> ga chiqarilgach, tugmaning tayanchi doim oyna bo'ladi.
 *
 * HARAKAT. Faqat `transform` va `opacity` — ikkalasi ham kompozitor qatlamida
 * ishlaydi, shuning uchun layout ham, qayta bo'yash ham bo'lmaydi:
 *   · paydo bo'lish — scale 0 → 1, yengil sakrash bilan (spring)
 *   · bosilganda   — scale 0.9, qo'yib yuborilganda 1
 *   · pastga surilganda — pastga siljib yo'qoladi, tepaga surilganda qaytadi
 */

/** Yashirish/ko'rsatish uchun eng kam siljish (tasodifiy titrashga qarshi). */
const SCROLL_STEP = 14
/** Sahifaning shu qismida tugma har doim ko'rinadi. */
const ALWAYS_SHOWN_TOP = 90

export default function Fab({ onClick, label }) {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const queued = useRef(false)

  useEffect(() => {
    lastY.current = scrollTop()

    // Hisob-kitob har bir hodisada emas, kadr boshida bajariladi va holat
    // faqat haqiqatan o'zgarganda yangilanadi — ortiqcha render yo'q.
    const measure = () => {
      queued.current = false
      const y = scrollTop()
      const delta = y - lastY.current
      if (Math.abs(delta) < SCROLL_STEP) return
      lastY.current = y
      setVisible(delta < 0 || y < ALWAYS_SHOWN_TOP)
    }

    const handle = () => {
      if (queued.current) return
      queued.current = true
      requestAnimationFrame(measure)
    }

    return onScroll(handle)
  }, [])

  const button = (
    <motion.button
      type="button"
      className="fab"
      onClick={onClick}
      aria-label={label}
      title={label}
      tabIndex={visible ? 0 : -1}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
      animate={
        reduced
          ? { opacity: visible ? 1 : 0 }
          : { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7, y: visible ? 0 : 88 }
      }
      transition={
        reduced
          ? { duration: 0.12 }
          : { type: 'spring', stiffness: 420, damping: 26, mass: 0.7 }
      }
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.9 }}
    >
      <PlusIcon size={24} />
    </motion.button>
  )

  return createPortal(button, document.body)
}
