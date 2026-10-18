import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthRequired from '../components/AuthRequired.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { CheckIcon, CrownIcon, XIcon } from '../components/Icons.jsx'
import { errorMessage, purchasePremium } from '../services/index.js'
import { useT } from '../i18n/index.jsx'
import { listContainer, listItem, tap } from '../motion.js'
import { PLANS } from '../plans.js'
import useCurrentUser from '../currentUser.jsx'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/**
 * Tariflar: Default ($0) va Premium ($9.99).
 *
 * Xususiyatlar ro'yxati ikkala tarif uchun bitta jadvaldan chiziladi —
 * shunda farq bir qarashda ko'rinadi.
 *
 * MOCK: to'lov tizimi ulanmagan. "Sotib olish" bosilganda spinner
 * ko'rsatiladi, so'ng hisob premiumga o'tadi (services/mock/account.js).
 */

/** Jadval qatorlari: [tarjima kaliti, default qiymat, premium qiymat]. */
function rows(t) {
  return [
    { key: 'limitOffers', free: String(PLANS.default.limits.offers), pro: String(PLANS.premium.limits.offers) },
    { key: 'limitRequests', free: String(PLANS.default.limits.requests), pro: String(PLANS.premium.limits.requests) },
    { key: 'stats', free: true, pro: true },
    { key: 'chat', free: true, pro: true },
    { key: 'badge', free: false, pro: true },
    { key: 'calculator', free: false, pro: true },
    { key: 'video', free: false, pro: true },
  ].map((row) => ({ ...row, label: t(`plan.f.${row.key}`) }))
}

function Cell({ value }) {
  if (value === true) return <span className="plan-yes"><CheckIcon size={15} /></span>
  if (value === false) return <span className="plan-no"><XIcon size={15} /></span>
  return <span className="plan-num num">{value}</span>
}

export default function PremiumPage() {
  useLogMount('PremiumPage')
  const navigate = useNavigate()
  const t = useT()
  const { user, loading, setUser } = useCurrentUser()

  const [busy, setBusy] = useState(false)
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')

  const isPremium = Boolean(user?.is_premium)

  const upgrade = async () => {
    setBusy(true)
    setAlert('')
    try {
      const result = await purchasePremium('premium')
      setUser(result.profile)
      log.front('Premium sotib olindi (MOCK)')
      setToast(t('plan.purchased'))
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setBusy(false)
    }
  }

  if (!loading && !user) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={t('plan.title')} backTo="/profil" backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t('plan.authHint')} />
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={t('plan.title')}
        subtitle={t('plan.subtitle')}
        backTo="/profil"
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        <motion.div className="plan-cards" variants={listContainer} initial="initial" animate="animate">
          <motion.div className={`plan-card${isPremium ? '' : ' is-current'}`} variants={listItem}>
            <span className="plan-name">{t('plan.default')}</span>
            <span className="plan-price num">$0</span>
            <span className="plan-period">{t('plan.forever')}</span>
            {!isPremium && <span className="badge badge-success">{t('plan.current')}</span>}
          </motion.div>

          <motion.div className={`plan-card is-pro${isPremium ? ' is-current' : ''}`} variants={listItem}>
            <span className="plan-name">
              <CrownIcon size={15} />
              {t('plan.premium')}
            </span>
            <span className="plan-price num">${PLANS.premium.priceUsd}</span>
            <span className="plan-period">{t('plan.perMonth')}</span>
            {isPremium && <span className="badge badge-premium">{t('plan.current')}</span>}
          </motion.div>
        </motion.div>

        {/* ----------------------------- Taqqoslash ---------------------------- */}
        <div className="plan-table" role="table" aria-label={t('plan.compare')}>
          <div className="plan-row plan-row-head" role="row">
            <span className="plan-feature">{t('plan.compare')}</span>
            <span>{t('plan.default')}</span>
            <span>{t('plan.premium')}</span>
          </div>

          {rows(t).map((row) => (
            <div className="plan-row" role="row" key={row.key}>
              <span className="plan-feature">{row.label}</span>
              <Cell value={row.free} />
              <Cell value={row.pro} />
            </div>
          ))}
        </div>

        <p className="plan-note">{t('plan.bothRoles')}</p>

        {isPremium ? (
          <motion.button
            type="button"
            className="btn btn-secondary"
            whileTap={tap}
            onClick={() => navigate('/profil')}
          >
            <CheckIcon size={17} />
            {t('plan.active')}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            className="btn btn-primary"
            whileTap={tap}
            onClick={upgrade}
            disabled={busy}
          >
            {busy ? <span className="spinner" /> : <CrownIcon size={17} />}
            {busy ? t('plan.processing') : t('plan.upgrade', { price: PLANS.premium.priceUsd })}
          </motion.button>
        )}

        <p className="plan-mock-note">{t('plan.mockNote')}</p>
      </main>

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
