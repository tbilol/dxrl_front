import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthRequired from '../components/AuthRequired.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import PlainCalculator from '../components/PlainCalculator.jsx'
import YieldEstimator from '../components/calc/YieldEstimator.jsx'
import { CalculatorIcon, CrownIcon, SproutIcon } from '../components/Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring, tap } from '../motion.js'
import { hasFeature } from '../plans.js'
import useCurrentUser from '../currentUser.jsx'
import useLogMount from '../useLogMount.js'

/**
 * SUPER KALKULYATOR — ikki rejim:
 *   · hosil bashorati (faqat Premium) — ekin turi, maydon va urug' miqdori;
 *   · oddiy kalkulyator — kundalik arifmetika, hammaga ochiq.
 *
 * Ikkala rejim bir xil ko'rinishda: ekran + klaviatura (components/calc/).
 */
export default function CalculatorPage() {
  useLogMount('CalculatorPage')
  const navigate = useNavigate()
  const t = useT()
  const { user, loading } = useCurrentUser()

  const [mode, setMode] = useState('yield') // 'yield' | 'plain'
  const premium = hasFeature(user, 'calculator')

  /* ---------------------------- Kirmagan holat ---------------------------- */

  if (!loading && !user) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={t('calc.title')} backTo="/" backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t('calc.authHint')} />
        </main>
      </PageShell>
    )
  }

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

            {/* Hosil bashorati — Premium xususiyati. */}
            {mode === 'yield' && !premium && (
              <div className="form-card premium-gate">
                <span className="verify-mark" aria-hidden="true">
                  <CrownIcon size={22} />
                </span>
                <h2 className="verify-title">{t('calc.premiumTitle')}</h2>
                <p className="verify-text">{t('calc.premiumText')}</p>
                <motion.button
                  type="button"
                  className="btn btn-primary"
                  whileTap={tap}
                  onClick={() => navigate('/premium')}
                >
                  <CrownIcon size={17} />
                  {t('plan.seePlans')}
                </motion.button>
              </div>
            )}

            {mode === 'yield' && premium && <YieldEstimator />}
          </motion.div>
        </AnimatePresence>
      </main>
    </PageShell>
  )
}
