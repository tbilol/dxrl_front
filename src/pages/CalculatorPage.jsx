import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import PlainCalculator from '../components/PlainCalculator.jsx'
import YieldEstimator from '../components/calc/YieldEstimator.jsx'
import { CalculatorIcon, SproutIcon } from '../components/Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import useLogMount from '../useLogMount.js'

/**
 * SUPER KALKULYATOR — ikki rejim:
 *   · hosil bashorati — ekin turi, maydon va urug' miqdori;
 *   · oddiy kalkulyator — kundalik arifmetika.
 * Ikkalasi ham hamma uchun bepul (kirish ham shart emas).
 *
 * Ikkala rejim bir xil ko'rinishda: ekran + klaviatura (components/calc/).
 */
export default function CalculatorPage() {
  useLogMount('CalculatorPage')
  const t = useT()

  const [mode, setMode] = useState('yield') // 'yield' | 'plain'

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={t('calc.title')}
        subtitle={t('calc.subtitle')}
        backTo="/"
        backLabel={t('common.back')}
      />

      <main className="page">
        {/* ------------------------------ Rejimlar ----------------------------- */}
        <div className="tabs" role="tablist">
          {[
            { id: 'yield', label: t('calc.modeYield'), Icon: SproutIcon },
            { id: 'plain', label: t('calc.modePlain'), Icon: CalculatorIcon },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={mode === opt.id}
              className={`tab${mode === opt.id ? ' active' : ''}`}
              onClick={() => setMode(opt.id)}
            >
              {mode === opt.id && <motion.span layoutId="calc-tab" className="tab-ind" transition={spring} />}
              <span>
                <opt.Icon size={14} />
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }}
          >
            {mode === 'plain' && <PlainCalculator />}

            {mode === 'yield' && <YieldEstimator />}
          </motion.div>
        </AnimatePresence>
      </main>
    </PageShell>
  )
}
