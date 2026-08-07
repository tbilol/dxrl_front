import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage, getMe } from './api.js'
import { clearToken, getToken } from './auth.js'

/**
 * Joriy foydalanuvchi profilini /api/auth/me dan yuklaydi.
 * Token bo'lmasa yoki yaroqsiz bo'lsa — user null bo'ladi.
 */
export default function useCurrentUser() {
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
      return data
    } catch (err) {
      if (activeRef.current) {
        setUser(null)
        // 401 bo'lsa token allaqachon tozalangan — xato ko'rsatishning hojati yo'q.
        if (err?.response?.status !== 401) setError(errorMessage(err))
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
    clearToken()
    setUser(null)
    setError('')
  }, [])

  return { user, setUser, loading, error, setError, reload, logout }
}
