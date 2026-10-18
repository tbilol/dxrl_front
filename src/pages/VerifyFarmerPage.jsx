import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AuthRequired from '../components/AuthRequired.jsx'
import FormInput from '../components/FormInput.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { CheckIcon, ShieldCheckIcon } from '../components/Icons.jsx'
import { errorMessage, verifyFarmer } from '../services/index.js'
import { useT } from '../i18n/index.jsx'
import { tap } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/** Shartnoma raqami: kamida shuncha belgi. */
const MIN_LENGTH = 6

/**
 * E-IJARA — dehqonni tasdiqlash.
 *
 * Faqat tasdiqlangan dehqon "Dehqonlar" doskasiga e'lon joylay oladi.
 * Foydalanuvchi yer ijarasi shartnomasi raqamini kiritadi va u tekshiriladi.
 *
 * MOCK: hozircha e-ijara xizmatiga so'rov yo'q — qisqa kutishdan keyin
 * har qanday raqam tasdiqlanadi (services/mock/account.js).
 */
export default function VerifyFarmerPage() {
  useLogMount('VerifyFarmerPage')
  const navigate = useNavigate()
  const t = useT()
  const { user, loading, setUser } = useCurrentUser()

  const [contract, setContract] = useState('')
  const [error, setError] = useState('')
  const [alert, setAlert] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setAlert('')

    const value = contract.trim()
    if (value.length < MIN_LENGTH) {
      setError(t('verify.errContract'))
      return
    }

    setBusy(true)
    try {
      const result = await verifyFarmer(value)
      setUser(result.profile)
      log.front('Dehqon tasdiqlandi (MOCK)', { contract: value })
      setToast(t('verify.success'))
      setTimeout(() => navigate('/takliflar/yangi', { replace: true }), 900)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setBusy(false)
    }
  }

  if (!loading && !user) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={t('verify.title')} backTo="/" backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t('verify.authHint')} />
        </main>
      </PageShell>
    )
  }

  const verified = Boolean(user?.is_verified_farmer)

  return (
    <PageShell variant="slide" width="form">
      <Header title={t('verify.title')} subtitle={t('verify.subtitle')} backTo="/" backLabel={t('common.back')} />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        <div className="form-card">
          <div className="verify-hero">
            <span className="verify-mark" aria-hidden="true">
              <ShieldCheckIcon size={22} />
            </span>
            <h2 className="verify-title">{verified ? t('verify.doneTitle') : t('verify.heroTitle')}</h2>
            <p className="verify-text">{verified ? t('verify.doneText') : t('verify.heroText')}</p>
          </div>

          {verified ? (
            <motion.button
              type="button"
              className="btn btn-primary"
              whileTap={tap}
              onClick={() => navigate('/takliflar/yangi')}
            >
              <CheckIcon size={17} />
              {t('offers.new')}
            </motion.button>
          ) : (
            <form onSubmit={submit} noValidate>
              <FormInput
                label={t('verify.contract')}
                name="contract"
                value={contract}
                onChange={(e) => {
                  setContract(e.target.value)
                  setError('')
                }}
                placeholder={t('verify.contractPlaceholder')}
                hint={t('verify.contractHint')}
                error={error}
                required
              />

              <motion.button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 'var(--s-4)' }}
                whileTap={tap}
                disabled={busy}
              >
                {busy ? <span className="spinner" /> : <ShieldCheckIcon size={17} />}
                {busy ? t('verify.checking') : t('verify.submit')}
              </motion.button>
            </form>
          )}

          <ul className="verify-steps">
            <li>{t('verify.step1')}</li>
            <li>{t('verify.step2')}</li>
            <li>{t('verify.step3')}</li>
          </ul>
        </div>
      </main>

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
