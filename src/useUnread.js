import { useCallback, useEffect, useRef, useState } from 'react'
import { getUnreadCount } from './api.js'
import { getToken } from './auth.js'

/**
 * O'qilmagan xabarlar sonini davriy tekshiradi (pastki menyudagi nishon uchun).
 * WebSocket keyinroq qo'shilishi mumkin — hozircha polling.
 */
export default function useUnread(intervalMs = 10000) {
  const [count, setCount] = useState(0)
  const activeRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setCount(0)
      return
    }
    try {
      const value = await getUnreadCount()
      if (activeRef.current) setCount(value)
    } catch {
      /* jimgina o'tkazamiz — nishon ikkinchi darajali ma'lumot */
    }
  }, [])

  useEffect(() => {
    activeRef.current = true
    refresh()

    const timer = setInterval(() => {
      // Sahifa ko'rinmayotgan bo'lsa so'rov yubormaymiz (batareya/tarmoq tejash).
      if (document.visibilityState === 'visible') refresh()
    }, intervalMs)

    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      activeRef.current = false
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh, intervalMs])

  return { count, refresh }
}
