import { useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertIcon } from './Icons.jsx'

/**
 * Suzuvchi yorliqli maydon (input / textarea / select).
 * Yorliq placeholder o'rnini bosmaydi — u doim ko'rinadi (a11y: input-labels).
 */
export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  error = '',
  hint = '',
  options = null,
  suffix = '',
  textarea = false,
  ...rest
}) {
  const id = useId()
  const filled = value !== '' && value !== null && value !== undefined
  const className = `float-field${filled || options ? ' filled' : ''}${error ? ' invalid' : ''}`

  const shared = {
    id,
    name,
    value: value ?? '',
    onChange,
    className: 'control',
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-err` : undefined,
    ...rest,
  }

  return (
    <div className="field">
      <div className={className}>
        {options ? (
          <select {...shared}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : textarea ? (
          <textarea {...shared} placeholder={placeholder} rows={4} />
        ) : (
          <input {...shared} type={type} placeholder={filled ? placeholder : ''} />
        )}

        <label className="float-label" htmlFor={id}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>

        {suffix && !textarea && <span className="suffix">{suffix}</span>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.div
            key="err"
            id={`${id}-err`}
            className="field-error"
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <AlertIcon size={13} />
            {error}
          </motion.div>
        ) : hint ? (
          <motion.div
            key="hint"
            className="field-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hint}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
