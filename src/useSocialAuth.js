/**
 * Google va iCloud (Apple) orqali kirish — bitta joyda.
 *
 * MOCK: haqiqiy OAuth qayta yo'naltirish yo'q. Tugma bosilgach xizmat
 * qatlami qisqa kutishdan keyin soxta token qaytaradi, profil qayta
 * o'qiladi va foydalanuvchi kirgan holatga o'tadi.
 */

import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken } from './auth.js'
import useCurrentUser from './currentUser.jsx'
import log from './logger.js'
import { signInWithApple, signInWithGoogle } from './services/index.js'

export default function useSocialAuth(redirectTo = '/profil') {
  const { reload } = useCurrentUser()
  const navigate = useNavigate()
  const [busy, setBusy] = useState('') // '' | 'google' | 'apple'

  const signIn = useCallback(
    async (provider) => {
      log.auth(`${provider} orqali kirish boshlandi (MOCK)`)
      setBusy(provider)
      try {
        const data = provider === 'apple' ? await signInWithApple() : await signInWithGoogle()
        setToken(data.access_token)
        await reload()
        log.auth('Kirish muvaffaqiyatli (MOCK)', { userId: data.profile?.id })
        if (redirectTo) navigate(redirectTo, { replace: true })
        return data
      } finally {
        setBusy('')
      }
    },
    [navigate, redirectTo, reload],
  )

  return { busy, signIn }
}
