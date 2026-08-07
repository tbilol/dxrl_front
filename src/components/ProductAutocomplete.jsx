import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import FormInput from './FormInput.jsx'
import { getProductSuggestions } from '../api.js'

/** Mahsulot nomi + bazadagi mavjud nomlardan takliflar. */
export default function ProductAutocomplete({ label, value, onChange, placeholder, error }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const pickedRef = useRef(false)

  // Yozishni to'xtatgandan 220ms keyin so'rov yuboramiz (debounce).
  useEffect(() => {
    if (pickedRef.current) {
      pickedRef.current = false
      return undefined
    }

    let active = true
    const timer = setTimeout(() => {
      getProductSuggestions(value || '')
        .then((data) => active && setItems(data))
        .catch(() => active && setItems([]))
    }, 220)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [value])

  // Tashqariga bosilganda ro'yxatni yopamiz.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const pick = (name) => {
    pickedRef.current = true
    onChange(name)
    setOpen(false)
  }

  const visible = open && items.length > 0

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <FormInput
        label={label}
        name="product"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        required
        error={error}
        autoComplete="off"
      />

      <AnimatePresence>
        {visible && (
          <motion.div
            className="suggestions"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            {items.map((item) => (
              <button
                key={item.product}
                type="button"
                className="suggestion"
                onClick={() => pick(item.product)}
              >
                <span>{item.product}</span>
                {item.count > 0 && <span className="count">{item.count}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
