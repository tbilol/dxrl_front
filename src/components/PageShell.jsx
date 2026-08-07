import { motion, useReducedMotion } from 'framer-motion'
import { fadePage, maybe, slidePage } from '../motion.js'

/**
 * Har bir sahifa shu qobiq ichida — AnimatePresence unga kirish/chiqish
 * animatsiyasini beradi. variant="slide" ichki sahifalar uchun (o'ngdan suriladi).
 */
export default function PageShell({ children, variant = 'fade', className }) {
  const reduced = useReducedMotion()
  const variants = maybe(variant === 'slide' ? slidePage : fadePage, reduced)

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}
