import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import log from './logger.js'
import { KEYS, readStored, writeStored } from './storage.js'

const STORAGE_KEY = KEYS.theme
/** Ikkita mavzu: yorug' va tungi. */
export const THEMES = ['light', 'dark']

const ThemeContext = createContext(null)

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/**
 * Saqlangan mavzu. Hech narsa tanlanmagan bo'lsa (yoki eski 'system' qiymati
 * qolgan bo'lsa) — birinchi marta OS sozlamasidan boshlanadi.
 */
function readSavedTheme() {
  const saved = readStored(STORAGE_KEY)
  if (saved && THEMES.includes(saved)) return saved
  return systemPrefersDark() ? 'dark' : 'light'
}

function paint(theme) {
  document.documentElement.dataset.theme = theme
  // Brauzer manzil paneli rangi ham mavzuga moslashadi.
  const meta = document.querySelector('meta[name="theme-color"]')
  // Rang qiymatlari index.css dagi --color-bg-primary bilan bir xil.
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#121212' : '#FFFFFF')
}

/**
 * React render bo'lishidan oldin (main.jsx) chaqiriladi — shunda sahifa
 * yorug' mavzuda "chaqnab" ketmaydi.
 */
export function applyStoredTheme() {
  paint(readSavedTheme())
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readSavedTheme)

  useEffect(() => {
    paint(theme)
    writeStored(STORAGE_KEY, theme)
    log.front('Mavzu o\'zgardi', theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next)
  }, [])

  const value = useMemo(
    () => ({ theme, resolved: theme, setTheme, isDark: theme === 'dark' }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme() faqat <ThemeProvider> ichida ishlaydi')
  return ctx
}
