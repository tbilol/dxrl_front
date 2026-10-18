import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, ChevronDownIcon, SearchIcon } from './Icons.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { PRODUCTS, productLabel, searchProducts } from '../data/products.js'

/**
 * Mahsulot turini tanlash — qidiruvli ro'yxat.
 *
 * Erkin matn kiritish YO'Q: foydalanuvchi faqat `src/data/products.js`
 * dagi turlardan birini tanlaydi. Shuning uchun bazaga mavjud bo'lmagan
 * mahsulot nomi tushmaydi.
 *
 * `value` — tanlangan mahsulot `id` si; `onChange(id)` bilan qaytadi.
 */
export default function ProductSelect({
  label,
  value,
  onChange,
  placeholder,
  error,
  items = PRODUCTS,
  required = true,
}) {
  const { lang, t } = useLanguage()
  const labelId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const boxRef = useRef(null)
  const searchRef = useRef(null)

  const selected = items.find((p) => p.id === value) ?? null
  const shown = useMemo(() => searchProducts(query, items), [query, items])

  // Tashqariga bosilganda yopiladi.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Ro'yxat ochilganda qidiruv maydoni darhol faollashadi.
  useEffect(() => {
    if (open) searchRef.current?.focus()
    else setQuery('')
  }, [open])

  const pick = (product) => {
    onChange(product.id)
    setOpen(false)
  }

  return (
    <div className="field product-field" ref={boxRef}>
      <span className="field-label" id={labelId}>
        {label}
        {required && (
          <span className="field-req" aria-hidden="true">
            *
          </span>
        )}
      </span>

      <div className={`field-box${error ? ' invalid' : ''}`}>
        <button
          type="button"
          className={`control select-trigger${selected ? '' : ' is-empty'}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={labelId}
          aria-invalid={Boolean(error)}
        >
          <span>{selected ? productLabel(selected, lang) : placeholder}</span>
          <ChevronDownIcon size={16} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="popover product-pop"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="product-search">
              <SearchIcon size={15} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('form.productSearch')}
                aria-label={t('form.productSearch')}
              />
            </div>

            <div className="product-list">
              {shown.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  role="option"
                  aria-selected={product.id === value}
                  className="popover-item"
                  onClick={() => pick(product)}
                >
                  <span>{productLabel(product, lang)}</span>
                  {product.id === value && <CheckIcon size={14} />}
                </button>
              ))}

              {shown.length === 0 && <p className="product-none">{t('search.noResults')}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="field-msg is-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
