import { motion, useReducedMotion } from 'framer-motion'
import { fadePage, maybe, slidePage } from '../motion.js'

/**
 * Har bir sahifa shu qobiq ichida — u sahifaga faqat KIRISH animatsiyasini
 * beradi (transform + opacity). Chiqish animatsiyasi ataylab yo'q: u yangi
 * sahifaning mount bo'lishini kutdirib, navigatsiyani sekinlashtirardi.
 * variant="slide" ichki sahifalar uchun (o'ngdan suriladi).
 *
 * width — sahifa kengligi tokeni (`--page-max`):
 *   'list' (1680px, kartalar to'ri) · 'wide' (1180px) · 'mid' (720px)
 *   'form' (560px) · 'full' (cheksiz)
 */
const WIDTHS = { list: 'w-list', wide: 'w-wide', mid: 'w-mid', form: 'w-form', full: 'w-full' }

export default function PageShell({ children, variant = 'fade', width = 'wide', className }) {
  const reduced = useReducedMotion()
  const variants = maybe(variant === 'slide' ? slidePage : fadePage, reduced)
  const classes = [WIDTHS[width] || WIDTHS.wide, className].filter(Boolean).join(' ')

  return (
    <motion.div variants={variants} initial="initial" animate="animate" className={classes}>
      {children}
    </motion.div>
  )
}
