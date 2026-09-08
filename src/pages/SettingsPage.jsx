import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AppleIcon,
  BugIcon,
  CheckIcon,
  GlobeIcon,
  GoogleIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PhoneIcon,
  SunIcon,
  XIcon,
} from '../components/Icons.jsx'
import {
  APPLE_LOGIN_URL,
  errorMessage,
  GOOGLE_LOGIN_URL,
  linkPhonePassword,
  unlinkPhonePassword,
  updateProfile,
} from '../api.js'
import { LANGUAGES, useLanguage } from '../i18n/index.jsx'
import { spring, tap, tapSmall } from '../motion.js'
import { useTheme } from '../theme.jsx'
import useCurrentUser from '../useCurrentUser.js'
import { formatPhoneInput, isPhoneComplete } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

const APP_VERSION = '3.0.0'
const MIN_PASSWORD = 6

export default function SettingsPage() {
  useLogMount('SettingsPage')
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user, setUser, loading, logout } = useCurrentUser()

  const [form, setForm] = useState({ name: '', phone: '', address: '', role: 'dehqon' })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  // "Ulangan akkauntlar" bo'limi: telefon + parol qo'shish formasi.
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkForm, setLinkForm] = useState({ phone: '', password: '' })
  const [linkErrors, setLinkErrors] = useState({})
  const [linking, setLinking] = useState(false)

  // Dasturchi rejimi — brauzer konsolidagi batafsil loglarni yoqadi.
  const [debug, setDebugState] = useState(() => log.isDebug())

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      phone: user.phone ? formatPhoneInput(user.phone) : '',
      address: user.address || '',
      role: user.role || 'dehqon',
    })
  }, [user])

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const save = async (e) => {
    e.preventDefault()
    setAlert('')

    const next = {}
    if (!form.name.trim()) next.name = t('form.errName')
    if (!form.phone.replace(/\D/g, '').replace(/^998/, '')) next.phone = t('form.errPhone')
    else if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await updateProfile(user.id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
        role: form.role,
      })
      setUser(saved)
      setToast(t('profile.saved'))
      log.front('Profil saqlandi', { userId: saved?.id })
      log.store('Profil localStorage dagi sessiyaga yangilandi')
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  const openLink = () => {
    setLinkForm({ phone: form.phone || user?.phone || '', password: '' })
    setLinkErrors({})
    setLinkOpen(true)
  }

  const submitLink = async (e) => {
    e.preventDefault()
    const next = {}
    if (!isPhoneComplete(linkForm.phone)) next.phone = t('form.errPhoneFormat')
    if (linkForm.password.length < MIN_PASSWORD) next.password = t('auth.errPasswordShort')
    setLinkErrors(next)
    if (Object.keys(next).length) return

    setLinking(true)
    try {
      const saved = await linkPhonePassword({
        phone: linkForm.phone.trim(),
        password: linkForm.password,
      })
      setUser(saved)
      setLinkOpen(false)
      setToast(t('settings.linkPhoneSaved'))
      log.auth('Telefon + parol ulandi', { userId: saved?.id })
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setLinking(false)
    }
  }

  const removeLink = async () => {
    if (!window.confirm(t('settings.unlinkPhoneConfirm'))) return
    try {
      setUser(await unlinkPhonePassword())
      setToast(t('settings.unlinkedPhone'))
      log.auth('Parol bilan kirish uzildi')
    } catch (err) {
      setAlert(errorMessage(err, t))
    }
  }

  const toggleDebug = () => {
    const next = log.setDebug(!debug)
    setDebugState(next)
    setToast(t(next ? 'settings.debugEnabled' : 'settings.debugDisabled'))
  }

  const goOAuth = (provider, url) => () => {
    log.auth(`${provider} akkauntini ulash boshlandi`)
    window.location.href = url
  }

  const handleLogout = () => {
    if (!window.confirm(t('settings.logoutConfirm'))) return
    logout()
    navigate('/profil', { replace: true })
  }

  const themeOptions = [
    { id: 'light', label: t('settings.themeLight'), Icon: SunIcon },
    { id: 'dark', label: t('settings.themeDark'), Icon: MoonIcon },
    { id: 'system', label: t('settings.themeSystem'), Icon: MonitorIcon },
  ]

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        backTo="/profil"
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        {loading && <BlockSkeleton height={260} />}

        {!loading && !user && <AuthRequired text={t('auth.profileIntro')} />}

        {!loading && user && (
          <>
            {/* ---------------------------- Akkaunt ---------------------------- */}
            <h2 className="section-title">{t('settings.account')}</h2>

            <form onSubmit={save} className="form-card">
              <FormInput
                label={t('profile.email')}
                name="email"
                value={user.email || '—'}
                onChange={() => {}}
                readOnly
                hint={t('settings.accountHint')}
              />

              <FormInput
                label={t('form.yourName')}
                name="name"
                value={form.name}
                onChange={set('name')}
                required
                error={errors.name}
                autoComplete="name"
              />

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

              <FormInput
                label={t('listing.address')}
                name="address"
                value={form.address}
                onChange={set('address')}
                placeholder={t('form.addressPlaceholder')}
              />

              <FormInput
                label={t('role.dehqon') + ' / ' + t('role.sotib_oluvchi')}
                name="role"
                value={form.role}
                onChange={set('role')}
                options={[
                  { value: 'dehqon', label: t('role.dehqon') },
                  { value: 'sotib_oluvchi', label: t('role.sotib_oluvchi') },
                ]}
              />

              <motion.button
                type="submit"
                className="btn btn-primary"
                whileTap={tap}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <CheckIcon size={18} />
                    {t('common.save')}
                  </>
                )}
              </motion.button>
            </form>

            {/* ------------------------------ Til ------------------------------ */}
            <h2 className="section-title">{t('settings.language')}</h2>
            <div className="info-list">
              <div className="info-row">
                <GlobeIcon size={19} />
                <div className="body">
                  <div className="k">{t('settings.language')}</div>
                  <div className="v">{LANGUAGES.find((l) => l.code === lang)?.label}</div>
                </div>
              </div>
              <div className="choice-row">
                {LANGUAGES.map((option) => (
                  <motion.button
                    key={option.code}
                    type="button"
                    className={`choice${lang === option.code ? ' active' : ''}`}
                    whileTap={tapSmall}
                    onClick={() => setLang(option.code)}
                    aria-pressed={lang === option.code}
                  >
                    {lang === option.code && <CheckIcon size={15} />}
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ----------------------------- Mavzu ----------------------------- */}
            <h2 className="section-title">{t('settings.theme')}</h2>
            <div className="info-list">
              <div className="choice-row">
                {themeOptions.map(({ id, label, Icon }) => (
                  <motion.button
                    key={id}
                    type="button"
                    className={`choice${theme === id ? ' active' : ''}`}
                    whileTap={tapSmall}
                    onClick={() => setTheme(id)}
                    aria-pressed={theme === id}
                  >
                    <motion.span
                      style={{ display: 'grid' }}
                      animate={{ rotate: theme === id ? 0 : -12, scale: theme === id ? 1.06 : 1 }}
                      transition={spring}
                    >
                      <Icon size={16} />
                    </motion.span>
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ------------------------ Ulangan akkauntlar ---------------------- */}
            <h2 className="section-title">{t('settings.linkedAccounts')}</h2>

            <div className="info-list">
              {/* Google */}
              <div className="info-row link-row">
                <GoogleIcon size={19} />
                <div className="body">
                  <div className="v">{t('settings.methodGoogle')}</div>
                  <div className={`k ${user.has_google ? 'is-on' : ''}`}>
                    {user.has_google ? t('settings.linked') : t('settings.notLinked')}
                  </div>
                </div>
                {user.has_google ? (
                  <CheckIcon size={18} className="link-ok" />
                ) : (
                  <motion.button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    whileTap={tapSmall}
                    onClick={goOAuth('Google', GOOGLE_LOGIN_URL)}
                  >
                    {t('settings.link')}
                  </motion.button>
                )}
              </div>

              {/* Telefon + parol */}
              <div className="info-row link-row">
                <PhoneIcon size={19} />
                <div className="body">
                  <div className="v">{t('settings.methodPhone')}</div>
                  <div className={`k ${user.has_password ? 'is-on' : ''}`}>
                    {user.has_password ? t('settings.linked') : t('settings.notLinked')}
                  </div>
                </div>
                {user.has_password ? (
                  <motion.button
                    type="button"
                    className="btn btn-danger btn-sm"
                    whileTap={tapSmall}
                    onClick={removeLink}
                  >
                    {t('settings.unlink')}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    whileTap={tapSmall}
                    onClick={openLink}
                  >
                    {t('settings.link')}
                  </motion.button>
                )}
              </div>

              {/* Telefon + parol qo'shish formasi */}
              <AnimatePresence initial={false}>
                {linkOpen && (
                  <motion.form
                    className="link-form"
                    onSubmit={submitLink}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="link-form-title">{t('settings.linkPhoneTitle')}</h3>

                    <FormInput
                      label={t('listing.phone')}
                      name="link-phone"
                      type="tel"
                      inputMode="tel"
                      value={linkForm.phone}
                      onChange={(e) =>
                        setLinkForm((p) => ({ ...p, phone: formatPhoneInput(e.target.value) }))
                      }
                      placeholder={t('form.phonePlaceholder')}
                      error={linkErrors.phone}
                      autoComplete="tel"
                    />

                    <PasswordInput
                      label={t('auth.password')}
                      name="link-password"
                      value={linkForm.password}
                      onChange={(e) =>
                        setLinkForm((p) => ({ ...p, password: e.target.value }))
                      }
                      error={linkErrors.password}
                      hint={t('auth.passwordHint')}
                      autoComplete="new-password"
                    />

                    <div className="btn-row">
                      <motion.button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        whileTap={tapSmall}
                        onClick={() => setLinkOpen(false)}
                      >
                        <XIcon size={15} />
                        {t('common.cancel')}
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        whileTap={tapSmall}
                        disabled={linking}
                      >
                        {linking ? <span className="spinner" /> : <CheckIcon size={15} />}
                        {t('common.save')}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* iCloud */}
              <div className="info-row link-row">
                <AppleIcon size={19} />
                <div className="body">
                  <div className="v">{t('settings.methodApple')}</div>
                  <div className={`k ${user.has_apple ? 'is-on' : ''}`}>
                    {user.has_apple ? t('settings.linked') : t('settings.notLinked')}
                  </div>
                </div>
                {user.has_apple ? (
                  <CheckIcon size={18} className="link-ok" />
                ) : (
                  <motion.button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    whileTap={tapSmall}
                    onClick={goOAuth('Apple (iCloud)', APPLE_LOGIN_URL)}
                  >
                    {t('settings.link')}
                  </motion.button>
                )}
              </div>
            </div>

            <p className="field-hint" style={{ marginBottom: 'var(--sp-5)' }}>
              {t('settings.linkedHint')}
            </p>

            {/* ---------------------------- Dasturchi --------------------------- */}
            <h2 className="section-title">{t('settings.developer')}</h2>

            <div className="info-list">
              <button type="button" className="info-row debug-row" onClick={toggleDebug}>
                <BugIcon size={19} />
                <div className="body">
                  <div className="v">{t('settings.debugMode')}</div>
                  {/* Rang yagona belgi emas — matn ham holatni aytadi. */}
                  <div className={`k ${debug ? 'is-on' : ''}`}>
                    {t(debug ? 'settings.debugOn' : 'settings.debugOff')}
                  </div>
                </div>

                <span
                  className={`switch${debug ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={debug}
                  aria-label={t('settings.debugMode')}
                >
                  <motion.span
                    className="switch-knob"
                    layout
                    transition={spring}
                  />
                </span>
              </button>
            </div>

            <p className="field-hint" style={{ marginBottom: 'var(--sp-5)' }}>
              {t('settings.debugHint')}
            </p>

            {/* ----------------------------- Chiqish --------------------------- */}
            <motion.button
              type="button"
              className="btn btn-danger"
              style={{ marginTop: 'var(--sp-5)' }}
              whileTap={tap}
              onClick={handleLogout}
            >
              <LogOutIcon size={18} />
              {t('auth.logout')}
            </motion.button>

            <p className="app-version">
              {t('app.name')} · {t('app.version')} {APP_VERSION}
            </p>
          </>
        )}
      </main>

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
