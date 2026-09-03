import { motion, useReducedMotion } from 'framer-motion'
import { fadePage, maybe, slidePage } from '../motion.js'

/**
 * Har bir sahifa shu qobiq ichida — AnimatePresence unga kirish/chiqish
 * animatsiyasini beradi. variant="slide" ichki sahifalar uchun (o'ngdan suriladi).
 *
 * width — sahifa kengligi tokeni (`--page-max`):
 *   'wide' (1200px, ro'yxatlar) · 'mid' (760px) · 'form' (560px) · 'full' (cheksiz)
 */
const WIDTHS = { wide: 'w-wide', mid: 'w-mid', form: 'w-form', full: 'w-full' }

export default function PageShell({ children, variant = 'fade', width = 'wide', className }) {
  const reduced = useReducedMotion()
  const variants = maybe(variant === 'slide' ? slidePage : fadePage, reduced)
  const classes = [WIDTHS[width] || WIDTHS.wide, className].filter(Boolean).join(' ')

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={classes}
    >
      {children}
    </motion.div>
  )
}
