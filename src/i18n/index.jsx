import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import ru from './ru.json'
import uz from './uz.json'

import log from '../logger.js'
import { KEYS, readStored, writeStored } from '../storage.js'

const DICTS = { uz, ru }
const STORAGE_KEY = KEYS.lang
export const DEFAULT_LANG = 'uz'

export const LANGUAGES = [
  { code: 'uz', label: "O'zbek", short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
]

const LanguageContext = createContext(null)

function readSavedLang() {
  const saved = readStored(STORAGE_KEY)
  if (saved && DICTS[saved]) return saved
  return DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readSavedLang)

  useEffect(() => {
    writeStored(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    log.i18n('Til almashtirildi', lang)
  }, [lang])

  /** t('listing.price') yoki t('form.step', { current: 1, total: 3 }) */
  const t = useCallback(
    (key, vars) => {
      let text = DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value))
        }
      }
      return text
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage() faqat <LanguageProvider> ichida ishlaydi')
  return ctx
}

/** Faqat tarjima funksiyasi kerak bo'lganda. */
export function useT() {
  return useLanguage().t
}
