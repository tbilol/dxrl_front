import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { ListingSkeleton } from '../components/Skeletons.jsx'
import { CartIcon, GavelIcon, SettingsIcon } from '../components/Icons.jsx'
import {
  deleteAuction,
  deleteRequest,
  errorMessage,
  getAuctions,
  getRequests,
} from '../api.js'
import { useT } from '../i18n/index.jsx'
import { listContainer, spring, tapSmall } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import { ROLE_KEYS } from '../utils.js'

export default function ProfilePage() {
  const navigate = useNavigate()
  const t = useT()
  const { user, loading, error } = useCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tab, setTab] = useState('auctions')
  const [auctions, setAuctions] = useState(null)
  const [requests, setRequests] = useState(null)
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')

  // Google xatolik bilan qaytargan bo'lsa (?auth_error=...) — ko'rsatamiz.
  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (!authError) return
    setAlert(authError)
    searchParams.delete('auth_error')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams])

  const loadListings = useCallback(async () => {
    if (!user) return
    try {
      const [a, r] = await Promise.all([
        getAuctions({ owner_id: user.id }),
        getRequests({ owner_id: user.id }),
      ])
      setAuctions(a)
      setRequests(r)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setAuctions([])
      setRequests([])
    }
  }, [user, t])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  const remove = async (item, kind) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    try {
      if (kind === 'auction') {
        await deleteAuction(item.id)
        setAuctions((prev) => prev.filter((x) => x.id !== item.id))
      } else {
        await deleteRequest(item.id)
        setRequests((prev) => prev.filter((x) => x.id !== item.id))
      }
      setToast(t('listing.deleted'))
    } catch (err) {
      setAlert(errorMessage(err, t))
    }
  }

  const shownAlert = alert || error

  /* --------------------------- Kirmagan holat --------------------------- */

  if (!loading && !user) {
    return (
      <PageShell>
        <Header title={t('profile.title')} subtitle={t('profile.signInSubtitle')} />
        <main className="page">
          {shownAlert && <div className="alert">{shownAlert}</div>}
          <AuthRequired
            icon="leaf"
            title={t('auth.welcome')}
            text={t('auth.profileIntro')}
            note={t('auth.browseFree')}
          />
        </main>
      </PageShell>
    )
  }

  const list = tab === 'auctions' ? auctions : requests
  const kind = tab === 'auctions' ? 'auction' : 'request'

  return (
    <PageShell>
      <Header
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        actions={
          <motion.button
            type="button"
            className="header-btn"
            whileTap={tapSmall}
            onClick={() => navigate('/sozlamalar')}
            aria-label={t('settings.title')}
          >
            <SettingsIcon size={20} />
          </motion.button>
        }
      />

      <main className="page">
        {shownAlert && <div className="alert">{shownAlert}</div>}

        {loading && <div className="skeleton" style={{ height: 210 }} />}

        {!loading && user && (
          <>
            {/* ----------------------- A. Foydalanuvchi ---------------------- */}
            <motion.div
              className="profile-head"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={spring}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Avatar name={user.name} src={user.avatar_url} size={78} />
              </motion.div>

              <h2>{user.name}</h2>
              {user.email && <div className="profile-email">{user.email}</div>}

              <span className={`badge${user.role === 'dehqon' ? '' : ' badge-orange'}`}>
                {t(ROLE_KEYS[user.role] || 'role.dehqon')}
              </span>

              <div className="counts">
                <span>{t('auctions.count', { count: auctions?.length ?? 0 })}</span>
                <span>·</span>
                <span>{t('requests.count', { count: requests?.length ?? 0 })}</span>
              </div>

              <motion.button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 'var(--sp-4)' }}
                whileTap={tapSmall}
                onClick={() => navigate('/sozlamalar')}
              >
                {t('profile.edit')}
              </motion.button>
            </motion.div>

            {!user.phone && <div className="alert alert-warn">{t('profile.noPhone')}</div>}

            {/* ------------------------ B. E'lonlarim ------------------------ */}
            <h2 className="section-title">{t('profile.myListings')}</h2>

            <div className="segment" role="tablist">
              {[
                { id: 'auctions', label: t('profile.myAuctions') },
                { id: 'requests', label: t('profile.myRequests') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === opt.id}
                  className={`segment-btn${tab === opt.id ? ' active' : ''}`}
                  onClick={() => setTab(opt.id)}
                >
                  {tab === opt.id && (
                    <motion.span
                      layoutId="segment-ind"
                      className="segment-ind"
                      transition={spring}
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {list === null && <ListingSkeleton count={2} />}

                {list !== null && list.length === 0 && (
                  <EmptyState
                    icon={tab === 'auctions' ? GavelIcon : CartIcon}
                    title={t(tab === 'auctions' ? 'profile.noAuctions' : 'profile.noRequests')}
                    action={
                      <motion.button
                        type="button"
                        className="btn btn-primary"
                        whileTap={tapSmall}
                        onClick={() =>
                          navigate(tab === 'auctions' ? '/auksion/yangi' : '/sorovlar/yangi')
                        }
                      >
                        {t(tab === 'auctions' ? 'auctions.new' : 'requests.new')}
                      </motion.button>
                    }
                  />
                )}

                {list !== null && list.length > 0 && (
                  <motion.div variants={listContainer} initial="initial" animate="animate">
                    {list.map((item) => (
                      <ListingCard
                        key={item.id}
                        item={item}
                        kind={kind}
                        onEdit={(it) =>
                          navigate(
                            kind === 'auction'
                              ? `/auksion/${it.id}/tahrir`
                              : `/sorovlar/${it.id}/tahrir`,
                          )
                        }
                        onDelete={(it) => remove(it, kind)}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
