import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons.jsx'
import { tapSmall } from '../motion.js'

/**
 * Sahifa ustidagi yopishqoq panel: orqaga tugmasi, sarlavha va o'ngdagi amallar.
 * `backTo` berilsa orqaga tugmasi chiqadi, `actions` — o'ng tomondagi tugmalar.
 */
export default function Header({ title, subtitle, backTo, actions, backLabel = 'Orqaga' }) {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="topbar-row">
        {backTo && (
          <motion.button
            type="button"
            className="icon-btn"
            whileTap={tapSmall}
            onClick={() => navigate(backTo)}
            aria-label={backLabel}
          >
            <ArrowLeftIcon size={17} />
          </motion.button>
        )}

        <div className="topbar-titles">
          <motion.h1
            className="topbar-title"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
          {subtitle && <p className="topbar-sub">{subtitle}</p>}
        </div>

        {actions && <div className="topbar-actions">{actions}</div>}
      </div>
    </header>
  )
}
