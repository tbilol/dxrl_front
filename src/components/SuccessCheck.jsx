import { motion, useReducedMotion } from 'framer-motion'
import { spring } from '../motion.js'

/** Forma yuborilgandan keyingi "belgi chiziladi" animatsiyasi. */
export default function SuccessCheck({ title, subtitle }) {
  const reduced = useReducedMotion()

  return (
    <div className="success-wrap">
      <motion.div
        className="success-ring"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring}
      >
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
          <motion.circle
            cx="26"
            cy="26"
            r="22"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
          />
          <motion.path
            d="M16 27l7 7 13-14"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.34, delay: 0.34, ease: 'easeOut' }
            }
          />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.5 }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          style={{ color: 'var(--text-2)', marginTop: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.6 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
