import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { APPLE_LOGIN_URL, GOOGLE_LOGIN_URL } from '../api.js'
import { AppleIcon, GoogleIcon, LeafIcon, LockIcon, PhoneIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import log from '../logger.js'
import { listContainer, listItem, spring, tap } from '../motion.js'

/**
 * Tizimga kirmagan foydalanuvchiga ko'rsatiladigan karta —
 * uchta kirish usuli: Google, iCloud (Apple) va telefon + parol.
 */
export default function AuthRequired({ icon = 'lock', title, text, note }) {
  const t = useT()
  const navigate = useNavigate()
  const Icon = icon === 'leaf' ? LeafIcon : LockIcon

  // OAuth uchun to'liq sahifa yo'naltirish kerak (axios emas).
  const go = (provider, url) => () => {
    log.auth(`${provider} orqali kirish boshlandi`, url)
    window.location.href = url
  }

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="auth-icon"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <Icon size={32} />
      </motion.div>

      <h2>{title || t('auth.signInRequired')}</h2>
      {text && <p>{text}</p>}

      <motion.div
        className="auth-methods"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        <motion.button
          type="button"
          className="btn btn-google"
          variants={listItem}
          whileTap={tap}
          onClick={go('Google', GOOGLE_LOGIN_URL)}
        >
          <GoogleIcon size={20} />
          {t('auth.withGoogle')}
        </motion.button>

        <motion.button
          type="button"
          className="btn btn-apple"
          variants={listItem}
          whileTap={tap}
          onClick={go('Apple (iCloud)', APPLE_LOGIN_URL)}
        >
          <AppleIcon size={20} />
          {t('auth.withApple')}
        </motion.button>

        <motion.button
          type="button"
          className="btn btn-secondary"
          variants={listItem}
          whileTap={tap}
          onClick={() => {
            log.auth('Telefon orqali kirish tanlandi')
            navigate('/kirish')
          }}
        >
          <PhoneIcon size={19} />
          {t('auth.withPhone')}
        </motion.button>
      </motion.div>

      {note && <p className="auth-note">{note}</p>}
    </motion.div>
  )
}
