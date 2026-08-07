import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../motion.js'

/** Qisqa bildirishnoma — 2.4s dan keyin o'zi yo'qoladi. */
export default function Toast({ message, onDone, duration = 2400 }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [message, onDone, duration])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={spring}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
