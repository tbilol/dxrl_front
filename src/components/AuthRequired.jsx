import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppleIcon, GoogleIcon, LeafIcon, LockIcon, PhoneIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { listContainer, listItem, tap } from '../motion.js'
import useSocialAuth from '../useSocialAuth.js'

/**
 * Tizimga kirmagan foydalanuvchiga ko'rsatiladigan karta —
 * uchta kirish usuli: Google, iCloud (Apple) va telefon + parol.
 */
export default function AuthRequired({ icon = 'lock', title, text, note }) {
  const t = useT()
  const navigate = useNavigate()
  const { busy, signIn } = useSocialAuth()
  const Icon = icon === 'leaf' ? LeafIcon : LockIcon

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="auth-mark" aria-hidden="true">
        <Icon size={18} />
      </span>

      <h2 className="auth-title">{title || t('auth.signInRequired')}</h2>
      {text && <p className="auth-text">{text}</p>}

      <motion.div
        className="auth-methods"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        <motion.button
          type="button"
          className="btn btn-secondary"
          variants={listItem}
          whileTap={tap}
          onClick={() => signIn('google')}
          disabled={Boolean(busy)}
        >
          {busy === 'google' ? <span className="spinner dark" /> : <GoogleIcon size={17} />}
          {t('auth.withGoogle')}
        </motion.button>

        <motion.button
          type="button"
          className="btn btn-apple"
          variants={listItem}
          whileTap={tap}
          onClick={() => signIn('apple')}
          disabled={Boolean(busy)}
        >
          {busy === 'apple' ? <span className="spinner" /> : <AppleIcon size={17} />}
          {t('auth.withApple')}
        </motion.button>

        <motion.button
          type="button"
          className="btn btn-ghost"
          variants={listItem}
          whileTap={tap}
          onClick={() => navigate('/kirish')}
        >
          <PhoneIcon size={16} />
          {t('auth.withPhone')}
        </motion.button>
      </motion.div>

      {note && <p className="auth-note">{note}</p>}
    </motion.div>
  )
}
