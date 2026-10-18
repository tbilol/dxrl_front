import { motion, useReducedMotion } from 'framer-motion'

/**
 * iOS uslubidagi almashtirgich.
 * Tugmacha faqat `transform: translateX` bilan suriladi (kompozitor qatlami),
 * fon rangi esa CSS o'tishi orqali — layout hech qachon qayta hisoblanmaydi.
 */
export default function Switch({ checked, onChange, disabled = false, label, id }) {
  const reduced = useReducedMotion()

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <motion.span
        className="switch-knob"
        aria-hidden="true"
        animate={{ x: checked ? 18 : 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 520, damping: 34, mass: 0.6 }
        }
      />
    </button>
  )
}
