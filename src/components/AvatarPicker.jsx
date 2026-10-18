import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { CameraIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { tapSmall } from '../motion.js'

/**
 * Profil rasmini tanlash: katta dumaloq avatar va uning burchagida
 * kamera nishoni. Bosilganda qurilmaning fayl tanlagichi ochiladi.
 *
 * Tanlangan rasm darhol ko'rsatiladi (URL.createObjectURL) — yuklash
 * tugashini kutish shart emas. Ota komponent faylning o'zini `onChange`
 * orqali oladi va uni saqlash paytida yuboradi.
 */

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function AvatarPicker({ name, src, size = 100, onChange }) {
  const t = useT()
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  // Har bir yangi ko'rinish uchun eskisining havolasi bo'shatiladi —
  // aks holda tanlangan rasmlar xotirada qolib ketadi.
  useEffect(() => {
    if (!preview) return undefined
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const pick = (event) => {
    const file = event.target.files?.[0]
    // Qiymatni tozalaymiz: xuddi shu faylni qayta tanlash ham hodisa bersin.
    event.target.value = ''
    if (!file) return

    if (!ALLOWED.includes(file.type)) {
      setError(t('profile.avatarTypeError'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t('profile.avatarSizeError'))
      return
    }

    setError('')
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  return (
    <div className="avatar-picker">
      <motion.button
        type="button"
        className="avatar-picker-btn"
        whileTap={tapSmall}
        onClick={() => inputRef.current?.click()}
        aria-label={t('profile.changeAvatar')}
      >
        <Avatar name={name} src={preview || src} size={size} />
        <span className="avatar-picker-badge" aria-hidden="true">
          <CameraIcon size={15} />
        </span>
      </motion.button>

      {/* Ko'rinmaydi — yuqoridagi tugma bosilganda ochiladi. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={pick}
      />

      <p
        className={`avatar-picker-hint${error ? ' is-error' : ''}`}
        role={error ? 'alert' : undefined}
      >
        {error || t('profile.avatarHint')}
      </p>
    </div>
  )
}
