import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import FollowButton from '../components/FollowButton.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import { ListingSkeleton } from '../components/Skeletons.jsx'
import {
  CartIcon,
  GavelIcon,
  MessageIcon,
  SendIcon,
  SettingsIcon,
} from '../components/Icons.jsx'
import {
  deleteAuction,
  deleteRequest,
  errorMessage,
  getAuctions,
  getProfile,
  getRequests,
  openConversation,
} from '../api.js'
import { useT } from '../i18n/index.jsx'
import { listContainer, spring, tapSmall } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import useUnread from '../useUnread.js'
import { ROLE_KEYS } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/**
 * Instagram uslubidagi profil.
 *   /profil            — o'z profili (tahrirlash, sozlamalar, xabarlar)
 *   /profile/:userId   — boshqa foydalanuvchi (obuna + xabar tugmalari)
 */
export default function ProfilePage() {
  useLogMount('ProfilePage')
  const { userId } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { user: me, loading: meLoading, error: meError } = useCurrentUser()
  const { count: unread } = useUnread()
  const [searchParams, setSearchParams] = useSearchParams()

  const [other, setOther] = useState(null)
  const [tab, setTab] = useState('auctions')
  const [auctions, setAuctions] = useState(null)
  const [requests, setRequests] = useState(null)
  const [followers, setFollowers] = useState(0)
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [opening, setOpening] = useState(false)

  // Google/Apple xatolik bilan qaytargan bo'lsa (?auth_error=...) — ko'rsatamiz.
  useEffect(() => {
    const authError = searchParams.get('auth_error')
    if (!authError) return
    setAlert(authError)
    searchParams.delete('auth_error')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Boshqa foydalanuvchi profilini yuklaymiz.
  useEffect(() => {
    if (!userId) return undefined
    let active = true
    setOther(null)
    getProfile(userId)
      .then((data) => active && setOther(data))
      .catch((err) => active && setAlert(errorMessage(err, t)))
    return () => {
      active = false
    }
  }, [userId, t])

  const profile = userId ? other : me
  const isOwn = Boolean(profile?.is_me)

  useEffect(() => {
    if (profile) setFollowers(profile.followers_count ?? 0)
  }, [profile])

  const loadListings = useCallback(async () => {
    if (!profile?.id) return
    try {
      const [a, r] = await Promise.all([
        getAuctions({ owner_id: profile.id }),
        getRequests({ owner_id: profile.id }),
      ])
      setAuctions(a)
      setRequests(r)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setAuctions([])
      setRequests([])
    }
  }, [profile?.id, t])

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
      log.front('E\'lon o\'chirildi', { id: item.id, kind })
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.front.error('E\'lonni o\'chirib bo\'lmadi', err)
    }
  }

  const startChat = async () => {
    setOpening(true)
    try {
      const conv = await openConversation(profile.id)
      log.chat('Suhbat ochildi', { conversationId: conv.id, with: profile.id })
      navigate(`/xabarlar/${conv.id}`)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setOpening(false)
    }
  }

  const shownAlert = alert || (userId ? '' : meError)

  /* ------------------------- Kirmagan holat (o'z profili) ------------------------ */

  if (!userId && !meLoading && !me) {
    return (
      <PageShell width="mid">
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

  /* -------------------------------- Yuklanmoqda -------------------------------- */

  if (!profile) {
    return (
      <PageShell width="wide" variant={userId ? 'slide' : 'fade'}>
        <Header
          title={t('profile.title')}
          backTo={userId ? '/' : undefined}
          backLabel={t('common.back')}
        />
        <main className="page">
          {shownAlert ? (
            <EmptyState icon={MessageIcon} title={t('profile.notFound')} text={shownAlert} />
          ) : (
            <div className="skeleton" style={{ height: 210 }} />
          )}
        </main>
      </PageShell>
    )
  }

  const list = tab === 'auctions' ? auctions : requests
  const kind = tab === 'auctions' ? 'auction' : 'request'
  const postsCount =
    auctions && requests ? auctions.length + requests.length : profile.total_listings_count ?? 0

  const stats = [
    { key: 'posts', value: postsCount, label: t('profile.posts') },
    {
      key: 'followers',
      value: followers,
      label: t('profile.followers'),
      to: `/profile/${profile.id}/kuzatuvchilar`,
    },
    {
      key: 'following',
      value: profile.following_count ?? 0,
      label: t('profile.following'),
      to: `/profile/${profile.id}/kuzatilganlar`,
    },
  ]

  return (
    <PageShell width="wide" variant={userId ? 'slide' : 'fade'}>
      <Header
        title={isOwn ? t('profile.title') : profile.name}
        subtitle={isOwn ? t('profile.subtitle') : t(ROLE_KEYS[profile.role] || 'role.dehqon')}
        backTo={userId ? '/' : undefined}
        backLabel={t('common.back')}
        actions={
          isOwn ? (
            <>
              {/* Instagram uslubidagi qog'oz samolyot — xabarlar shu yerda. */}
              <motion.button
                type="button"
                className="header-btn"
                whileTap={tapSmall}
                onClick={() => navigate('/xabarlar')}
                aria-label={`${t('profile.openMessages')}${unread > 0 ? ` (${unread})` : ''}`}
              >
                <SendIcon size={20} />
                {unread > 0 && (
                  <motion.span
                    className="dot-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    {unread > 99 ? '99+' : unread}
                  </motion.span>
                )}
              </motion.button>

              <motion.button
                type="button"
                className="header-btn"
                whileTap={tapSmall}
                onClick={() => navigate('/sozlamalar')}
                aria-label={t('settings.title')}
              >
                <SettingsIcon size={20} />
              </motion.button>
            </>
          ) : null
        }
      />

      <main className="page">
        {shownAlert && <div className="alert">{shownAlert}</div>}

        <div className="profile-grid">
          {/* ---------------------------- Profil boshi ---------------------------- */}
          <div className="profile-aside">
            <motion.section
              className="ig-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ig-top">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={spring}
                >
                  <Avatar
                    name={profile.name}
                    src={profile.avatar_url}
                    size={80}
                    className="avatar-ring"
                  />
                </motion.div>

                <div className="ig-stats">
                  {stats.map((s) =>
                    s.to ? (
                      <motion.button
                        key={s.key}
                        type="button"
                        className="ig-stat"
                        whileTap={tapSmall}
                        onClick={() => navigate(s.to)}
                      >
                        <span className="ig-stat-value num">{s.value}</span>
                        <span className="ig-stat-label">{s.label}</span>
                      </motion.button>
                    ) : (
                      <div key={s.key} className="ig-stat">
                        <span className="ig-stat-value num">{s.value}</span>
                        <span className="ig-stat-label">{s.label}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="ig-bio">
                <h2>{profile.name}</h2>
                <span className={`badge${profile.role === 'dehqon' ? '' : ' badge-orange'}`}>
                  {t(ROLE_KEYS[profile.role] || 'role.dehqon')}
                </span>
                {profile.address && <p className="ig-address">{profile.address}</p>}
              </div>

              <div className="ig-actions">
                {isOwn ? (
                  <>
                    <motion.button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      whileTap={tapSmall}
                      onClick={() => navigate('/sozlamalar')}
                    >
                      {t('profile.edit')}
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      whileTap={tapSmall}
                      onClick={() => navigate('/xabarlar')}
                    >
                      <SendIcon size={15} />
                      {t('profile.openMessages')}
                      {unread > 0 && <span className="inline-badge">{unread}</span>}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <FollowButton
                      userId={profile.id}
                      followed={profile.is_followed}
                      onChange={(data) => setFollowers(data.followers_count)}
                      className="btn btn-sm"
                    />
                    <motion.button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      whileTap={tapSmall}
                      onClick={startChat}
                      disabled={opening}
                    >
                      {opening ? <span className="spinner dark" /> : <MessageIcon size={15} />}
                      {t('profile.message')}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.section>

            {isOwn && !profile.phone && (
              <div className="alert alert-warn">{t('profile.noPhone')}</div>
            )}
          </div>

          {/* ------------------------------ E'lonlar ------------------------------ */}
          <div>
            <div className="segment ig-tabs" role="tablist">
              {[
                { id: 'auctions', label: t('profile.myAuctions'), Icon: GavelIcon },
                { id: 'requests', label: t('profile.myRequests'), Icon: CartIcon },
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
                  <span>
                    <opt.Icon size={15} />
                    {opt.label}
                  </span>
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
                {list === null && (
                  <div className="card-grid">
                    <ListingSkeleton count={2} />
                  </div>
                )}

                {list !== null && list.length === 0 && (
                  <EmptyState
                    icon={tab === 'auctions' ? GavelIcon : CartIcon}
                    title={t('profile.noListings')}
                    action={
                      isOwn ? (
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
                      ) : null
                    }
                  />
                )}

                {list !== null && list.length > 0 && (
                  <motion.div
                    className="card-grid"
                    variants={listContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {list.map((item) => (
                      <ListingCard
                        key={item.id}
                        item={item}
                        kind={kind}
                        onEdit={
                          isOwn
                            ? (it) =>
                                navigate(
                                  kind === 'auction'
                                    ? `/auksion/${it.id}/tahrir`
                                    : `/sorovlar/${it.id}/tahrir`,
                                )
                            : undefined
                        }
                        onDelete={isOwn ? (it) => remove(it, kind) : undefined}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
