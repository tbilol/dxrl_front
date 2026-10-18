import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { endSession, errorMessage, getMe } from './services/index.js'
import { clearToken, getToken } from './auth.js'
import log from './logger.js'

/**
 * Joriy foydalanuvchi profili — butun ilova uchun BITTA marta yuklanadi.
 *
 * Ilgari bu oddiy hook edi va uni ishlatgan har bir sahifa mount bo'lganda
 * /api/auth/me ga yangi so'rov yuborardi. Ya'ni Profil, Sozlamalar, Chat,
 * E'lon formasi va tafsilot sahifalariga har o'tganda tarmoq borish-kelishi
 * kutilardi va shu vaqt ichida sahifa skelet holatida turardi.
 * Endi profil bitta joyda saqlanadi — navigatsiyada qayta so'ralmaydi.
 */

const CurrentUserContext = createContext(null)

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))
  const [error, setError] = useState('')
  const activeRef = useRef(true)

  useEffect(() => {
    activeRef.current = true
    return () => {
      activeRef.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    try {
      const data = await getMe()
      if (activeRef.current) setUser(data)
      log.auth('Profil yuklandi', { userId: data?.id, role: data?.role })
      return data
    } catch (err) {
      if (activeRef.current) {
        setUser(null)
        // 401 bo'lsa token allaqachon tozalangan — xato ko'rsatishning hojati yo'q.
        if (err?.response?.status !== 401) setError(errorMessage(err))
        else log.auth('Sessiya tugagan — foydalanuvchi tozalandi')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const logout = useCallback(() => {
    log.auth('Foydalanuvchi chiqmoqda')
    // MOCK: xizmat qatlamidagi sessiya ham yopiladi.
    endSession()
    clearToken()
    setUser(null)
    setError('')
  }, [])

  const value = useMemo(
    () => ({ user, setUser, loading, error, setError, reload, logout }),
    [user, loading, error, reload, logout],
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export default function useCurrentUser() {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser() faqat <CurrentUserProvider> ichida ishlaydi')
  return ctx
}
