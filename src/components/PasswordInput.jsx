import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertIcon, EyeIcon, EyeOffIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { tapSmall } from '../motion.js'

/** Parol maydoni — ko'rsatish/yashirish tugmasi bilan (a11y: password-toggle). */
export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  error = '',
  hint = '',
  autoComplete = 'current-password',
}) {
  const t = useT()
  const id = useId()
  const [shown, setShown] = useState(false)
  const filled = Boolean(value)

  return (
    <div className="field">
      <div className={`float-field has-toggle${filled ? ' filled' : ''}${error ? ' invalid' : ''}`}>
        <input
          id={id}
          name={name}
          type={shown ? 'text' : 'password'}
          className="control"
          value={value ?? ''}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <label className="float-label" htmlFor={id}>
          {label}
        </label>

        <motion.button
          type="button"
          className="input-toggle"
          whileTap={tapSmall}
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={shown}
        >
          {shown ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </motion.button>
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
