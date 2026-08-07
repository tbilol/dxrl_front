import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  CheckIcon,
  GlobeIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from '../components/Icons.jsx'
import { errorMessage, updateProfile } from '../api.js'
import { LANGUAGES, useLanguage } from '../i18n/index.jsx'
import { spring, tap, tapSmall } from '../motion.js'
import { useTheme } from '../theme.jsx'
import useCurrentUser from '../useCurrentUser.js'
import { formatPhoneInput, isPhoneComplete } from '../utils.js'

const APP_VERSION = '2.0.0'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { user, setUser, loading, logout } = useCurrentUser()

  const [form, setForm] = useState({ name: '', phone: '', address: '', role: 'dehqon' })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

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
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setSaving(false)
    }
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
    <PageShell variant="slide">
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

            <form onSubmit={save}>
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
