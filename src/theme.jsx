import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'agro_auksion_theme'
export const THEMES = ['light', 'dark', 'system']

const ThemeContext = createContext(null)

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && THEMES.includes(saved)) return saved
  } catch {
    /* localStorage o'chirilgan bo'lishi mumkin */
  }
  return 'system'
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function resolve(theme) {
  return theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme
}

function paint(resolved) {
  document.documentElement.dataset.theme = resolved
  // Brauzer manzil paneli rangi ham mavzuga moslashadi.
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0C1310' : '#0F7B4F')
}

/**
 * React render bo'lishidan oldin (main.jsx) chaqiriladi — shunda sahifa
 * yorug' mavzuda "chaqnab" ketmaydi.
 */
export function applyStoredTheme() {
  paint(resolve(readSavedTheme()))
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readSavedTheme)
  const [resolved, setResolved] = useState(() => resolve(readSavedTheme()))

  useEffect(() => {
    const next = resolve(theme)
    setResolved(next)
    paint(next)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* e'tiborsiz */
    }
  }, [theme])

  // "Tizim" tanlanganda OS mavzusi o'zgarsa — darhol moslashamiz.
  useEffect(() => {
    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const next = resolve('system')
      setResolved(next)
      paint(next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({ theme, resolved, setTheme, isDark: resolved === 'dark' }),
    [theme, resolved, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme() faqat <ThemeProvider> ichida ishlaydi')
  return ctx
}
