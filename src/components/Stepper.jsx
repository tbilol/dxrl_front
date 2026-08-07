import { motion } from 'framer-motion'
import FormInput from './FormInput.jsx'
import { MinusIcon, PlusIcon } from './Icons.jsx'
import { tapSmall } from '../motion.js'

/** Miqdor uchun: +/− tugmalari va qo'lda kiritish imkoniyati birga. */
export default function Stepper({
  label,
  value,
  onChange,
  step = 0.5,
  min = 0,
  max = 100000,
  suffix,
  error,
  hint,
  decLabel = '−',
  incLabel = '+',
}) {
  const current = Number(value)
  const safe = Number.isFinite(current) ? current : 0

  const round = (n) => String(Number(n.toFixed(2)))
  const dec = () => onChange(round(Math.max(min, safe - step)))
  const inc = () => onChange(round(Math.min(max, safe + step)))

  return (
    <div className="field">
      <div className="stepper">
        <motion.button
          type="button"
          className="stepper-btn"
          onClick={dec}
          whileTap={tapSmall}
          disabled={safe <= min}
          aria-label={decLabel}
        >
          <MinusIcon size={20} />
        </motion.button>

        <FormInput
          label={label}
          name="quantity"
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          suffix={suffix}
          error={error}
          hint={hint}
        />

        <motion.button
          type="button"
          className="stepper-btn"
          onClick={inc}
          whileTap={tapSmall}
          aria-label={incLabel}
        >
          <PlusIcon size={20} />
        </motion.button>
      </div>
    </div>
  )
}
