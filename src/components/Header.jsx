import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons.jsx'
import { tapSmall } from '../motion.js'

/**
 * Gradientli sarlavha. `backTo` berilsa orqaga tugmasi chiqadi,
 * `actions` — o'ng tomondagi tugmalar (sozlamalar, xabarlar...).
 */
export default function Header({ title, subtitle, backTo, actions, backLabel = 'Orqaga' }) {
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-row">
        {backTo && (
          <motion.button
            type="button"
            className="header-btn"
            whileTap={tapSmall}
            onClick={() => navigate(backTo)}
            aria-label={backLabel}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>

        {actions}
      </div>
    </header>
  )
}
