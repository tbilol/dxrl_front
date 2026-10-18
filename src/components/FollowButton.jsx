import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserCheckIcon, UserPlusIcon } from './Icons.jsx'
import { followProfile, unfollowProfile } from '../services/index.js'
import { getToken } from '../auth.js'
import { useT } from '../i18n/index.jsx'
import { spring, tapSmall } from '../motion.js'
import log from '../logger.js'

/**
 * Obuna tugmasi. Bosilganda holat darhol o'zgaradi (optimistik),
 * server xato qaytarsa — eski holatga qaytariladi.
 */
export default function FollowButton({
  userId,
  followed = false,
  onChange,
  className = 'btn btn-sm',
}) {
  const t = useT()
  const navigate = useNavigate()
  const [isFollowed, setIsFollowed] = useState(followed)
  const [busy, setBusy] = useState(false)

  // Ota komponent yangi ma'lumot yuklaganda holatni moslashtiramiz.
  useEffect(() => setIsFollowed(followed), [followed])

  const toggle = async (e) => {
    e.stopPropagation()
    if (busy) return

    if (!getToken()) {
      log.front('Obuna uchun kirish talab qilinadi — /kirish ga o\'tilmoqda')
      navigate('/kirish')
      return
    }

    const next = !isFollowed
    setIsFollowed(next) // optimistik
    setBusy(true)
    try {
      const data = next ? await followProfile(userId) : await unfollowProfile(userId)
      setIsFollowed(data.is_followed)
      onChange?.(data)
      log.front(next ? 'Obuna bo\'lindi' : 'Obuna bekor qilindi', {
        userId,
        followers: data.followers_count,
      })
    } catch (err) {
      setIsFollowed(!next) // orqaga qaytaramiz
      log.front.error('Obuna amali bajarilmadi — holat qaytarildi', err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.button
      type="button"
      className={`${className} ${isFollowed ? 'btn-ghost is-following' : 'btn-fire'}`}
      whileTap={tapSmall}
      onClick={toggle}
      aria-pressed={isFollowed}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isFollowed ? 'on' : 'off'}
          className="follow-label"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={spring}
        >
          {isFollowed ? <UserCheckIcon size={14} /> : <UserPlusIcon size={14} />}
          {isFollowed ? t('profile.unfollow') : t('profile.follow')}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
