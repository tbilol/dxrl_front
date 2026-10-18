import { useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertIcon } from './Icons.jsx'

/**
 * Yorlig'i maydon ustida turadigan kiritish maydoni (input / textarea / select).
 * Yorliq doim ko'rinadi va bosilganda maydonni faollashtiradi (a11y: input-labels).
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
      <label className="field-label" htmlFor={id}>
        {label}
        {required && (
          <span className="field-req" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className={`field-box${error ? ' invalid' : ''}${suffix ? ' has-suffix' : ''}`}>
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
          <input {...shared} type={type} placeholder={placeholder} />
        )}

        {suffix && !textarea && <span className="field-suffix">{suffix}</span>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="err"
            id={`${id}-err`}
            className="field-msg is-error"
            role="alert"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
          >
            <AlertIcon size={13} />
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            className="field-msg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
