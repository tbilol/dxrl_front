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

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      <div className={`field-box has-toggle${error ? ' invalid' : ''}`}>
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

        <motion.button
          type="button"
          className="field-toggle"
          whileTap={tapSmall}
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={shown}
        >
          {shown ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </motion.button>
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
