import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import PasswordInput from '../components/PasswordInput.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import AvatarPicker from '../components/AvatarPicker.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { SettingsRow, SettingsSection } from '../components/SettingsList.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AppleIcon,
  CheckIcon,
  GoogleIcon,
  KeyIcon,
  LockIcon,
  PhoneIcon,
  UserIcon,
} from '../components/Icons.jsx'
import {
  errorMessage,
  linkPhonePassword,
  unlinkPhonePassword,
  updateProfile,
  uploadAvatar,
} from '../services/index.js'
import { useLanguage } from '../i18n/index.jsx'
import { tap, tapSmall } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import { formatPhoneInput, isPhoneComplete } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

const MIN_PASSWORD = 6

/** Huquqiy hujjatlar — matni tarjima fayllarida (legal.*). */
const DOCS = {
  shartlar: { titleKey: 'settings.terms', prefix: 'legal.terms', blocks: 4 },
  maxfiylik: { titleKey: 'settings.privacyPolicy', prefix: 'legal.privacy', blocks: 4 },
}

/**
 * Sozlamalarning ichki sahifalari — bittasi `section` bilan tanlanadi:
 *   profil · telefon · parol · akkauntlar · shartlar · maxfiylik
 *
 * Har biri /sozlamalar dagi bitta qatordan ochiladi. Shu tufayli asosiy
 * sozlamalar ekrani qisqa qoladi, brauzerning "orqaga" tugmasi esa
 * kutilgandek ishlaydi.
 */
export default function SettingsSubPage({ section }) {
  useLogMount(`SettingsSubPage:${section}`)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, setUser, loading } = useCurrentUser()

  const [form, setForm] = useState({
    name: '',
    address: '',
    role: 'dehqon',
    phone: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  // Tanlangan, lekin hali yuborilmagan profil rasmi.
  const [avatarFile, setAvatarFile] = useState(null)
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(null)

  const doc = DOCS[section]

  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      address: user.address || '',
      role: user.role || 'dehqon',
      phone: user.phone ? formatPhoneInput(user.phone) : '',
    }))
  }, [user])

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  /* ------------------------------ Saqlashlar ----------------------------- */

  const saveProfile = async (e) => {
    e.preventDefault()
    setAlert('')

    const next = {}
    if (!form.name.trim()) next.name = t('form.errName')
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await updateProfile(user.id, {
        name: form.name.trim(),
        address: form.address.trim() || null,
        role: form.role,
      })

      /*
       * Rasm alohida yuboriladi (matnli maydonlar bilan bir so'rovda emas):
       * serverda rasm endpointi hali yo'q, shuning uchun uning xatosi
       * profilning qolgan qismini saqlashga to'sqinlik qilmasligi kerak.
       * TODO: Upload profile image to backend — services/mock/profiles.js dagi uploadAvatar().
       */
      let withAvatar = saved
      if (avatarFile) {
        try {
          withAvatar = await uploadAvatar(user.id, avatarFile)
          setAvatarFile(null)
          log.front('Profil rasmi yuklandi', { userId: user.id })
        } catch (err) {
          log.front.error("Profil rasmini yuklab bo'lmadi", err)
          // Foydalanuvchi rasm saqlanmaganini bilishi kerak.
          setAlert(t('profile.avatarNotSupported'))
        }
      }

      setUser(withAvatar)
      setToast(t('profile.saved'))
      log.front('Profil saqlandi', { userId: saved?.id })
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  const savePhone = async (e) => {
    e.preventDefault()
    setAlert('')

    const next = {}
    if (!form.phone.replace(/\D/g, '').replace(/^998/, '')) next.phone = t('form.errPhone')
    else if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await updateProfile(user.id, { phone: form.phone.trim() })
      setUser(saved)
      setToast(t('settings.phoneSaved'))
      log.front('Telefon raqami yangilandi', { userId: saved?.id })
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setAlert('')

    const next = {}
    // Parol bilan kirish telefon raqamiga bog'langan — raqam bo'lishi shart.
    if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')
    if (form.password.length < MIN_PASSWORD) next.password = t('auth.errPasswordShort')
    if (form.confirm !== form.password) next.confirm = t('auth.errPasswordMismatch')
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await linkPhonePassword({
        phone: form.phone.trim(),
        password: form.password,
      })
      setUser(saved)
      setForm((prev) => ({ ...prev, password: '', confirm: '' }))
      setToast(user.has_password ? t('settings.passwordChanged') : t('settings.linkPhoneSaved'))
      log.auth('Parol o\'rnatildi', { userId: saved?.id })
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setSaving(false)
    }
  }

  const removePassword = async () => {
    setConfirming(null)
    try {
      setUser(await unlinkPhonePassword())
      setToast(t('settings.unlinkedPhone'))
      log.auth('Parol bilan kirish uzildi')
    } catch (err) {
      setAlert(errorMessage(err, t))
    }
  }

  /**
   * MOCK: akkauntni ulash. Haqiqiy OAuth o'rniga profil maydonini belgilab
   * qo'yamiz — serverda bu Google/Apple bilan bog'lash so'rovi bo'ladi.
   */
  const linkOAuth = (provider) => async () => {
    log.auth(`${provider} akkaunti ulanmoqda (MOCK)`)
    try {
      const saved = await updateProfile(user.id, {
        [provider === 'apple' ? 'has_apple' : 'has_google']: true,
      })
      setUser(saved)
      setToast(t('settings.linkedSaved'))
    } catch (err) {
      setAlert(errorMessage(err, t))
    }
  }

  /* ------------------------- Huquqiy hujjat sahifasi ---------------------- */

  if (doc) {
    return (
      <PageShell variant="slide" width="form">
        <Header
          title={t(doc.titleKey)}
          subtitle={t('legal.updated')}
          backTo="/sozlamalar"
          backLabel={t('common.back')}
        />
        <main className="page">
          <article className="legal">
            {Array.from({ length: doc.blocks }).map((_, i) => (
              <section key={i} className="legal-block">
                <h2 className="legal-title">{t(`${doc.prefix}${i + 1}Title`)}</h2>
                <p className="legal-text">{t(`${doc.prefix}${i + 1}Body`)}</p>
              </section>
            ))}
            <p className="legal-note">{t('legal.note')}</p>
          </article>
        </main>
      </PageShell>
    )
  }

  /* ------------------------------ Sarlavhalar ----------------------------- */

  const TITLES = {
    profil: ['settings.editProfile', 'settings.editProfileHint'],
    telefon: ['settings.changePhone', 'settings.changePhoneHint'],
    parol: ['settings.changePassword', 'settings.changePasswordHint'],
    akkauntlar: ['settings.linkedAccounts', 'settings.linkedHint'],
  }
  const [titleKey, subtitleKey] = TITLES[section] || TITLES.profil

  /* Sahifa karkasi. Yuklanish va "kirilmagan" holatlari shu yerda tugaydi —
     shundan keyingi bo'limlar `user` mavjudligiga tayanishi mumkin.
     (Ilgari karkasga JSX argument sifatida uzatilardi va u `user` hali null
     bo'lgan paytda ham hisoblanib, sahifani sindirardi.) */
  const shell = (children) => (
    <PageShell variant="slide" width="form">
      <Header
        title={t(titleKey)}
        subtitle={t(subtitleKey)}
        backTo="/sozlamalar"
        backLabel={t('common.back')}
      />
      <main className="page">
        {alert && <div className="alert">{alert}</div>}
        {children}
      </main>

      <ConfirmDialog
        open={confirming === 'unlink'}
        title={t('settings.unlinkPhoneConfirm')}
        confirmLabel={t('settings.unlink')}
        danger
        onConfirm={removePassword}
        onCancel={() => setConfirming(null)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )

  if (loading) return shell(<BlockSkeleton height={240} />)
  if (!user) return shell(<AuthRequired text={t('auth.profileIntro')} />)

  const submitButton = (
    <motion.button type="submit" className="btn btn-fire" whileTap={tap} disabled={saving}>
      {saving ? (
        <>
          <span className="spinner" />
          {t('common.saving')}
        </>
      ) : (
        <>
          <CheckIcon size={15} />
          {t('common.save')}
        </>
      )}
    </motion.button>
  )

  /* -------------------------- Profilni tahrirlash ------------------------- */

  if (section === 'profil') {
    return shell(
      <form onSubmit={saveProfile} className="form-card">
        <AvatarPicker
          name={user.name}
          src={user.avatar_url}
          onChange={setAvatarFile}
        />

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
          label={t('listing.address')}
          name="address"
          value={form.address}
          onChange={set('address')}
          placeholder={t('form.addressPlaceholder')}
        />

        <FormInput
          label={`${t('role.dehqon')} / ${t('role.sotib_oluvchi')}`}
          name="role"
          value={form.role}
          onChange={set('role')}
          options={[
            { value: 'dehqon', label: t('role.dehqon') },
            { value: 'sotib_oluvchi', label: t('role.sotib_oluvchi') },
          ]}
        />

        {submitButton}
      </form>,
    )
  }

  /* --------------------- Telefon raqamni o'zgartirish --------------------- */

  if (section === 'telefon') {
    return shell(
      <form onSubmit={savePhone} className="form-card">
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
          hint={t('settings.changePhoneNote')}
          autoComplete="tel"
        />

        {submitButton}
      </form>,
    )
  }

  /* ------------------------ Parolni o'zgartirish -------------------------- */

  if (section === 'parol') {
    return shell(
      <>
        <form onSubmit={savePassword} className="form-card">
          {/* Parol bilan kirish telefon raqamiga bog'langan. Raqam allaqachon
              bo'lsa — u faqat ko'rsatiladi, tahrirlash alohida sahifada. */}
          {user.phone ? (
            <FormInput
              label={t('listing.phone')}
              name="phone"
              value={form.phone}
              onChange={() => {}}
              readOnly
              hint={t('settings.passwordPhoneHint')}
            />
          ) : (
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
          )}

          <PasswordInput
            label={user.has_password ? t('settings.newPassword') : t('auth.password')}
            name="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint={t('auth.passwordHint')}
            autoComplete="new-password"
          />

          <PasswordInput
            label={t('auth.passwordConfirm')}
            name="confirm-password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            autoComplete="new-password"
          />

          {submitButton}
        </form>

        {user.has_password && (
          <SettingsSection icon={KeyIcon} title={t('settings.passwordLogin')}>
            <SettingsRow
              icon={LockIcon}
              label={t('settings.unlink')}
              description={t('settings.unlinkPhoneHint')}
              onClick={() => setConfirming('unlink')}
              danger
            />
          </SettingsSection>
        )}
      </>,
    )
  }

  /* ------------------------- Ulangan akkauntlar --------------------------- */

  const linkButton = (onClick) => (
    <motion.button
      type="button"
      className="btn btn-ghost btn-sm"
      whileTap={tapSmall}
      onClick={onClick}
    >
      {t('settings.link')}
    </motion.button>
  )

  const linkedMark = (
    <span className="set-value is-on">
      <CheckIcon size={14} />
      {t('settings.linked')}
    </span>
  )

  return shell(
    <SettingsSection icon={UserIcon} title={t('settings.linkedAccounts')} hint={t('settings.linkedHint')}>
      <SettingsRow
        icon={GoogleIcon}
        label={t('settings.methodGoogle')}
        description={user.has_google ? t('settings.linked') : t('settings.notLinked')}
        control={user.has_google ? linkedMark : linkButton(linkOAuth('google'))}
      />

      <SettingsRow
        icon={PhoneIcon}
        label={t('settings.methodPhone')}
        description={user.has_password ? t('settings.linked') : t('settings.notLinked')}
        control={
          user.has_password ? (
            <motion.button
              type="button"
              className="btn btn-danger btn-sm"
              whileTap={tapSmall}
              onClick={() => setConfirming('unlink')}
            >
              {t('settings.unlink')}
            </motion.button>
          ) : (
            linkButton(() => navigate('/sozlamalar/parol'))
          )
        }
      />

      <SettingsRow
        icon={AppleIcon}
        label={t('settings.methodApple')}
        description={user.has_apple ? t('settings.linked') : t('settings.notLinked')}
        control={
          user.has_apple ? linkedMark : linkButton(linkOAuth('apple'))
        }
      />
    </SettingsSection>,
  )
}
