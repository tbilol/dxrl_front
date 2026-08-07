import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PhoneIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring, tap } from '../motion.js'

/** Telefon raqami faqat "Aloqaga chiqish" bosilgandan keyin ko'rinadi. */
export default function PhoneReveal({ phone }) {
  const t = useT()
  const [shown, setShown] = useState(false)

  return (
    <div className="phone-reveal">
      <AnimatePresence mode="wait" initial={false}>
        {shown ? (
          <motion.a
            key="value"
            href={`tel:${String(phone).replace(/\s/g, '')}`}
            className="phone-value"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={spring}
          >
            <PhoneIcon size={19} />
            <span className="num">{phone}</span>
          </motion.a>
        ) : (
          <motion.button
            key="btn"
            type="button"
            className="btn btn-primary"
            whileTap={tap}
            onClick={() => setShown(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PhoneIcon size={18} />
            {t('listing.revealPhone')}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
