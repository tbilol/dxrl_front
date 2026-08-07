import { motion } from 'framer-motion'
import { GOOGLE_LOGIN_URL } from '../api.js'
import { GoogleIcon, LeafIcon, LockIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring, tap } from '../motion.js'

/** Tizimga kirmagan foydalanuvchiga ko'rsatiladigan Google kirish kartasi. */
export default function AuthRequired({ icon = 'lock', title, text, note }) {
  const t = useT()
  const Icon = icon === 'leaf' ? LeafIcon : LockIcon

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

      <motion.button
        type="button"
        className="btn btn-google"
        whileTap={tap}
        // Google sahifasiga to'liq yo'naltirish (axios emas).
        onClick={() => {
          window.location.href = GOOGLE_LOGIN_URL
        }}
      >
        <GoogleIcon size={20} />
        {t('auth.googleButton')}
      </motion.button>

      {note && <p className="auth-note">{note}</p>}
    </motion.div>
  )
}
