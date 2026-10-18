import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from './Icons.jsx'
import { spring } from '../motion.js'

/**
 * Qisqa bildirishnoma — 2.4s dan keyin o'zi yo'qoladi.
 * <ConfirmDialog> kabi <body> ga portal qilinadi: `position: fixed` element
 * transformlangan sahifa qobig'i ichida noto'g'ri joylashadi.
 */
export default function Toast({ message, onDone, duration = 2400 }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [message, onDone, duration])

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={spring}
        >
          <span className="toast-icon" aria-hidden="true">
            <CheckIcon size={13} />
          </span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
