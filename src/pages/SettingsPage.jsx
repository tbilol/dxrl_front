import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PageShell from '../components/PageShell.jsx'
import Switch from '../components/Switch.jsx'
import Toast from '../components/Toast.jsx'
import { SettingsRow, SettingsSection } from '../components/SettingsList.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  BellIcon,
  CheckIcon,
  CrownIcon,
  DatabaseIcon,
  DownloadIcon,
  FileTextIcon,
  InfoIcon,
  KeyIcon,
  LinkIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  MessageIcon,
  MoonIcon,
  PaletteIcon,
  PhoneIcon,
  PulseIcon,
  ShieldCheckIcon,
  ShieldIcon,
  StoreIcon,
  SunIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from '../components/Icons.jsx'
import { errorMessage, deleteProfile, getOffers, getRequests } from '../services/index.js'
import { useAppSettings } from '../appSettings.jsx'
import { LANGUAGES, useLanguage } from '../i18n/index.jsx'
import { spring, tapSmall } from '../motion.js'
import { useTheme } from '../theme.jsx'
import useCurrentUser from '../currentUser.jsx'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

export const APP_VERSION = '3.0.0'
const SUPPORT_EMAIL = 'yordam@agrogram.uz'

/**
 * Sozlamalar — guruhlangan ro'yxat.
 *
 * Har bir guruh alohida kartada, qatorlar ingichka chiziq bilan ajratilgan.
 * Uzun sozlamalar (profil, telefon, parol, hujjatlar) alohida ichki
 * sahifalarga chiqarilgan — shunda bu ekran bir qarashda o'qiladi.
 *
 * Mavzu va til kirmagan foydalanuvchiga ham ko'rinadi: ular qurilma
 * sozlamalari, akkauntga bog'liq emas.
 */
export default function SettingsPage() {
  useLogMount('SettingsPage')
  const navigate = useNavigate()
  const { lang, setLang, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { settings, set, toggle } = useAppSettings()
  const { user, loading, logout } = useCurrentUser()

  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState('') // 'download' | 'delete'
  // Tasdiqlash oynalari: 'logout' | 'cache' | 'deleteAccount'
  const [confirming, setConfirming] = useState(null)

  const go = (path) => () => navigate(path)

  /* ------------------------------- Amallar ------------------------------- */

  const handleLogout = () => {
    setConfirming(null)
    logout()
    navigate('/profil', { replace: true })
  }

  const clearCache = async () => {
    setConfirming(null)
    try {
      // Faqat kesh: token, mavzu va til (localStorage) tegilmaydi.
      if (window.caches?.keys) {
        const keys = await window.caches.keys()
        await Promise.all(keys.map((key) => window.caches.delete(key)))
      }
      sessionStorage.clear()
      log.store('Kesh tozalandi')
      setToast(t('settings.cacheCleared'))
    } catch (err) {
      log.store.error("Keshni tozalab bo'lmadi", err)
      setAlert(t('common.error'))
    }
  }

  const downloadData = async () => {
    setBusy('download')
    setAlert('')
    try {
      const [offers, requests] = await Promise.all([
        getOffers({ owner_id: user.id }),
        getRequests({ owner_id: user.id }),
      ])

      const payload = {
        app: 'AGROGRAM',
        version: APP_VERSION,
        exported_at: new Date().toISOString(),
        profile: user,
        offers,
        requests,
        settings,
      }

      const url = URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.download = `agrogram-${user.id}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      log.front("Ma'lumotlar yuklab olindi", { offers: offers.length, requests: requests.length })
      setToast(t('settings.dataDownloaded'))
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.front.error("Ma'lumotlarni yuklab bo'lmadi", err)
    } finally {
      setBusy('')
    }
  }

  const deleteAccount = async () => {
    setConfirming(null)
    setBusy('delete')
    setAlert('')
    try {
      await deleteProfile(user.id)
      log.auth("Hisob o'chirildi", { userId: user.id })
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.auth.error("Hisobni o'chirib bo'lmadi", err)
      setBusy('')
    }
  }

  const contactSupport = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('AGROGRAM')}`
  }

  /* ------------------------- Segment (mavzu / til) ------------------------ */

  const themeOptions = [
    { id: 'light', label: t('settings.themeLight'), Icon: SunIcon },
    { id: 'dark', label: t('settings.themeDark'), Icon: MoonIcon },
  ]

  const visibilityOptions = [
    { id: 'everyone', label: t('settings.visibilityEveryone') },
    { id: 'members', label: t('settings.visibilityMembers') },
  ]

  const themeControl = (
    <div className="seg" role="group" aria-label={t('settings.theme')}>
      {themeOptions.map(({ id, label, Icon }) => (
        <motion.button
          key={id}
          type="button"
          className={`seg-btn${theme === id ? ' active' : ''}`}
          whileTap={tapSmall}
          onClick={() => setTheme(id)}
          aria-pressed={theme === id}
        >
          <motion.span
            style={{ display: 'grid' }}
            animate={{ rotate: theme === id ? 0 : -12, scale: theme === id ? 1.06 : 1 }}
            transition={spring}
          >
            <Icon size={15} />
          </motion.span>
          {label}
        </motion.button>
      ))}
    </div>
  )

  const langControl = (
    <div className="seg" role="group" aria-label={t('settings.language')}>
      {LANGUAGES.map((option) => (
        <motion.button
          key={option.code}
          type="button"
          className={`seg-btn${lang === option.code ? ' active' : ''}`}
          whileTap={tapSmall}
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
        >
          {lang === option.code && <CheckIcon size={13} />}
          {option.label}
        </motion.button>
      ))}
    </div>
  )

  const visibilityControl = (
    <div className="seg" role="group" aria-label={t('settings.visibility')}>
      {visibilityOptions.map(({ id, label }) => (
        <motion.button
          key={id}
          type="button"
          className={`seg-btn${settings.profileVisibility === id ? ' active' : ''}`}
          whileTap={tapSmall}
          onClick={() => set('profileVisibility', id)}
          aria-pressed={settings.profileVisibility === id}
        >
          {settings.profileVisibility === id && <CheckIcon size={13} />}
          {label}
        </motion.button>
      ))}
    </div>
  )

  /** Bir xil ko'rinishdagi almashtirgichli qator. */
  const switchRow = (key, { icon, label, description, disabled = false }) => (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      labelFor={`set-${key}`}
      control={
        <Switch
          id={`set-${key}`}
          checked={settings[key]}
          onChange={() => toggle(key)}
          disabled={disabled}
          label={label}
        />
      }
    />
  )

  /* ------------------------- Har doim ko'rinadigan ------------------------ */

  const appearance = (
    <SettingsSection icon={PaletteIcon} title={t('settings.appearance')}>
      <SettingsRow
        icon={theme === 'dark' ? MoonIcon : SunIcon}
        label={t('settings.theme')}
        description={t('settings.themeHint')}
        control={themeControl}
        stacked
      />
      <SettingsRow
        icon={TagIcon}
        label={t('settings.language')}
        description={t('settings.languageHint')}
        control={langControl}
        stacked
      />
    </SettingsSection>
  )

  const about = (
    <SettingsSection icon={InfoIcon} title={t('settings.about')}>
      <SettingsRow
        icon={InfoIcon}
        label={t('app.version')}
        description={t('app.name')}
        control={<span className="set-value num">{APP_VERSION}</span>}
      />
      <SettingsRow
        icon={FileTextIcon}
        label={t('settings.terms')}
        onClick={go('/sozlamalar/shartlar')}
        chevron
      />
      <SettingsRow
        icon={LockIcon}
        label={t('settings.privacyPolicy')}
        onClick={go('/sozlamalar/maxfiylik')}
        chevron
      />
      <SettingsRow
        icon={MailIcon}
        label={t('settings.contact')}
        description={SUPPORT_EMAIL}
        onClick={contactSupport}
        chevron
      />
    </SettingsSection>
  )

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

        {loading && <BlockSkeleton height={280} />}

        {!loading && !user && (
          <>
            <AuthRequired text={t('auth.profileIntro')} />
            <div className="set-stack">
              {appearance}
              {about}
            </div>
          </>
        )}

        {!loading && user && (
          <div className="set-stack">
            {/* ----------------------------- Hisob ----------------------------- */}
            <SettingsSection icon={UserIcon} title={t('settings.account')}>
              <SettingsRow
                icon={UserIcon}
                label={t('settings.editProfile')}
                description={user.name || user.email || '—'}
                onClick={go('/sozlamalar/profil')}
                chevron
              />
              <SettingsRow
                icon={PhoneIcon}
                label={t('settings.changePhone')}
                description={user.phone || t('common.notSet')}
                onClick={go('/sozlamalar/telefon')}
                chevron
              />
              <SettingsRow
                icon={KeyIcon}
                label={t('settings.changePassword')}
                description={
                  user.has_password ? t('settings.passwordSet') : t('settings.passwordNotSet')
                }
                onClick={go('/sozlamalar/parol')}
                chevron
              />
              <SettingsRow
                icon={LinkIcon}
                label={t('settings.linkedAccounts')}
                description={t('settings.linkedCount', {
                  count:
                    Number(Boolean(user.has_google)) +
                    Number(Boolean(user.has_password)) +
                    Number(Boolean(user.has_apple)),
                })}
                onClick={go('/sozlamalar/akkauntlar')}
                chevron
              />
            </SettingsSection>

            {/* ----------------------------- Tarif ----------------------------- */}
            <SettingsSection icon={CrownIcon} title={t('plan.title')} hint={t('plan.settingsHint')}>
              <SettingsRow
                icon={CrownIcon}
                label={user.is_premium ? t('plan.premium') : t('plan.default')}
                description={user.is_premium ? t('plan.activeHint') : t('plan.upsell')}
                onClick={go('/premium')}
                chevron
              />
              <SettingsRow
                icon={ShieldCheckIcon}
                label={t('verify.title')}
                description={user.is_verified_farmer ? t('verify.badge') : t('verify.upsell')}
                onClick={go('/tasdiqlash')}
                chevron
              />
            </SettingsSection>

            {/* --------------------------- Ko'rinish --------------------------- */}
            {appearance}

            {/* ------------------------ Bildirishnomalar ----------------------- */}
            <SettingsSection icon={BellIcon} title={t('settings.notifications')}>
              {switchRow('pushEnabled', {
                icon: BellIcon,
                label: t('settings.push'),
                description: t('settings.pushHint'),
              })}
              {switchRow('notifyMessages', {
                icon: MessageIcon,
                label: t('settings.notifyMessages'),
                disabled: !settings.pushEnabled,
              })}
              {switchRow('notifyOffers', {
                icon: StoreIcon,
                label: t('settings.notifyOffers'),
                disabled: !settings.pushEnabled,
              })}
              {switchRow('notifyRequests', {
                icon: TagIcon,
                label: t('settings.notifyRequests'),
                disabled: !settings.pushEnabled,
              })}
              {switchRow('notifyPrices', {
                icon: PulseIcon,
                label: t('settings.notifyPrices'),
                disabled: !settings.pushEnabled,
              })}
            </SettingsSection>

            {/* ---------------------------- Maxfiylik --------------------------- */}
            <SettingsSection icon={ShieldIcon} title={t('settings.privacy')}>
              <SettingsRow
                icon={ShieldIcon}
                label={t('settings.visibility')}
                description={t('settings.visibilityHint')}
                control={visibilityControl}
                stacked
              />
              {switchRow('showPhone', {
                icon: PhoneIcon,
                label: t('settings.showPhone'),
                description: t('settings.showPhoneHint'),
              })}
              {switchRow('showLocation', {
                icon: MapPinIcon,
                label: t('settings.showLocation'),
              })}
              {switchRow('showOnline', {
                icon: PulseIcon,
                label: t('settings.showOnline'),
              })}
            </SettingsSection>

            {/* --------------------------- Ma'lumotlar -------------------------- */}
            <SettingsSection
              icon={DatabaseIcon}
              title={t('settings.data')}
              hint={t('settings.dataHint')}
            >
              <SettingsRow
                icon={TrashIcon}
                label={t('settings.clearCache')}
                description={t('settings.clearCacheHint')}
                onClick={() => setConfirming('cache')}
                chevron
              />
              <SettingsRow
                icon={DownloadIcon}
                label={t('settings.downloadData')}
                description={t('settings.downloadDataHint')}
                onClick={downloadData}
                disabled={busy === 'download'}
                control={busy === 'download' ? <span className="spinner dark" /> : null}
                chevron={busy !== 'download'}
              />
            </SettingsSection>

            {/* -------------------------- Ilova haqida -------------------------- */}
            {about}

            {/* ----------------------------- Chiqish ---------------------------- */}
            <SettingsSection icon={LogOutIcon} title={t('settings.session')}>
              <SettingsRow
                icon={LogOutIcon}
                label={t('settings.logout')}
                description={t('settings.logoutHint')}
                onClick={() => setConfirming('logout')}
                danger
              />
              <SettingsRow
                icon={TrashIcon}
                label={t('settings.deleteAccount')}
                description={t('settings.deleteAccountHint')}
                onClick={() => setConfirming('deleteAccount')}
                disabled={busy === 'delete'}
                control={busy === 'delete' ? <span className="spinner dark" /> : null}
                danger
              />
            </SettingsSection>
          </div>
        )}

        <p className="app-version">
          {t('app.name')} · {t('app.version')} {APP_VERSION}
        </p>
      </main>

      <ConfirmDialog
        open={confirming === 'logout'}
        title={t('settings.logoutConfirm')}
        confirmLabel={t('auth.logout')}
        danger
        onConfirm={handleLogout}
        onCancel={() => setConfirming(null)}
      />

      <ConfirmDialog
        open={confirming === 'cache'}
        title={t('settings.clearCacheConfirm')}
        text={t('settings.clearCacheConfirmHint')}
        confirmLabel={t('settings.clearCache')}
        onConfirm={clearCache}
        onCancel={() => setConfirming(null)}
      />

      <ConfirmDialog
        open={confirming === 'deleteAccount'}
        title={t('settings.deleteAccountConfirm')}
        text={t('settings.deleteAccountWarning')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={deleteAccount}
        onCancel={() => setConfirming(null)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
