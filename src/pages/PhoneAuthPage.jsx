import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import PageShell from '../components/PageShell.jsx'
import { AppleIcon, CheckIcon, GoogleIcon } from '../components/Icons.jsx'
import {
  APPLE_LOGIN_URL,
  errorMessage,
  GOOGLE_LOGIN_URL,
  phoneLogin,
  phoneRegister,
} from '../api.js'
import { setToken } from '../auth.js'
import { useT } from '../i18n/index.jsx'
import { spring, stepVariants, tap, tapSmall } from '../motion.js'
import { formatPhoneInput, isPhoneComplete } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

const MIN_PASSWORD = 6
const EMPTY = { name: '', phone: '', password: '', confirm: '' }

/** Telefon raqam + parol bilan kirish va ro'yxatdan o'tish (SMS talab qilinmaydi). */
export default function PhoneAuthPage() {
  useLogMount('PhoneAuthPage')
  const navigate = useNavigate()
  const t = useT()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const switchMode = (next) => {
    if (next === mode) return
    setMode(next)
    setErrors({})
    setAlert('')
  }

  const validate = () => {
    const next = {}
    if (isRegister && !form.name.trim()) next.name = t('form.errName')

    if (!form.phone.replace(/\D/g, '').replace(/^998/, '')) next.phone = t('form.errPhone')
    else if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')

    if (!form.password) next.password = t('auth.errPasswordRequired')
    else if (isRegister && form.password.length < MIN_PASSWORD)
      next.password = t('auth.errPasswordShort')

    if (isRegister && form.confirm !== form.password) next.confirm = t('auth.errPasswordMismatch')

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setAlert('')
    if (!validate()) return

    log.auth(isRegister ? "Ro'yxatdan o'tish boshlandi" : 'Kirish boshlandi', {
      mode,
      // Parol hech qachon logga tushmaydi.
      phone: form.phone,
    })

    setBusy(true)
    try {
      const data = isRegister
        ? await phoneRegister({
            name: form.name.trim(),
            phone: form.phone.trim(),
            password: form.password,
          })
        : await phoneLogin({ phone: form.phone.trim(), password: form.password })

      log.auth(isRegister ? 'Hisob yaratildi' : 'Kirish muvaffaqiyatli', {
        userId: data.profile?.id,
      })
      setToken(data.access_token)
      // To'liq qayta yuklash — useCurrentUser yangi token bilan qaytadan o'qiydi.
      window.location.assign('/profil')
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.auth.error(isRegister ? "Ro'yxatdan o'tib bo'lmadi" : 'Kirib bo\'lmadi', err)
      setBusy(false)
    }
  }

  const go = (provider, url) => () => {
    log.auth(`${provider} orqali kirish boshlandi`, url)
    window.location.href = url
  }

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={t('auth.phoneTitle')}
        subtitle={isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
        backTo="/profil"
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && (
          <div className="alert" role="alert">
            {alert}
          </div>
        )}

        <div className="form-card">
          {/* --------------------------- Kirish / Ro'yxat -------------------------- */}
          <div className="segment" role="tablist">
            {[
              { id: 'login', label: t('auth.tabLogin') },
              { id: 'register', label: t('auth.tabRegister') },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={mode === opt.id}
                className={`segment-btn${mode === opt.id ? ' active' : ''}`}
                onClick={() => switchMode(opt.id)}
              >
                {mode === opt.id && (
                  <motion.span layoutId="auth-ind" className="segment-ind" transition={spring} />
                )}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate>
            <AnimatePresence mode="wait" custom={isRegister ? 1 : -1} initial={false}>
              <motion.div
                key={mode}
                custom={isRegister ? 1 : -1}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="leave"
              >
                {isRegister && (
                  <FormInput
                    label={t('form.yourName')}
                    name="name"
                    value={form.name}
                    onChange={set('name')}
                    placeholder={t('form.namePlaceholder')}
                    required
                    error={errors.name}
                    autoComplete="name"
                  />
                )}

                <FormInput
                  label={t('listing.phone')}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set('phone')(formatPhoneInput(e.target.value))}
                  onFocus={() => !form.phone && set('phone')('+998 ')}
                  placeholder={t('form.phonePlaceholder')}
                  required
                  error={errors.phone}
                  autoComplete="tel"
                />

                <PasswordInput
                  label={t('auth.password')}
                  name="password"
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  hint={isRegister ? t('auth.passwordHint') : ''}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />

                {isRegister && (
                  <PasswordInput
                    label={t('auth.passwordConfirm')}
                    name="confirm"
                    value={form.confirm}
                    onChange={set('confirm')}
                    error={errors.confirm}
                    autoComplete="new-password"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <motion.button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 'var(--sp-4)' }}
              whileTap={tap}
              disabled={busy}
            >
              {busy ? (
                <span className="spinner" />
              ) : (
                <CheckIcon size={18} />
              )}
              {isRegister ? t('auth.submitRegister') : t('auth.submitLogin')}
            </motion.button>
          </form>
        </div>

        {/* ---------------------------- Boshqa usullar --------------------------- */}
        <h2 className="section-title">{t('auth.otherMethods')}</h2>

        <div className="auth-methods">
          <motion.button
            type="button"
            className="btn btn-google"
            whileTap={tapSmall}
            onClick={go('Google', GOOGLE_LOGIN_URL)}
          >
            <GoogleIcon size={20} />
            {t('auth.withGoogle')}
          </motion.button>

          <motion.button
            type="button"
            className="btn btn-apple"
            whileTap={tapSmall}
            onClick={go('Apple (iCloud)', APPLE_LOGIN_URL)}
          >
            <AppleIcon size={20} />
            {t('auth.withApple')}
          </motion.button>
        </div>
      </main>
    </PageShell>
  )
}
