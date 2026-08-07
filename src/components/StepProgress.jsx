import { motion } from 'framer-motion'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'

/** Ko'p qadamli formaning yuqorisidagi progress indikatori. */
export default function StepProgress({ current, total, labels = [] }) {
  const t = useT()
  const pct = (current / total) * 100

  return (
    <div>
      <div className="steps">
        <span className="step-label">{t('form.step', { current, total })}</span>
        <div
          className="step-track"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={total}
        >
          <motion.div
            className="step-fill"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={spring}
          />
        </div>
        <span className="step-label" style={{ color: 'var(--primary)' }}>
          {labels[current - 1]}
        </span>
      </div>
    </div>
  )
}
