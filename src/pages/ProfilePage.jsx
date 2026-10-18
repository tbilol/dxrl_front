import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import FollowButton from '../components/FollowButton.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PageShell from '../components/PageShell.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Toast from '../components/Toast.jsx'
import { ListingSkeleton } from '../components/Skeletons.jsx'
import {
  ClipboardIcon,
  MessageIcon,
  SearchIcon,
  SettingsIcon,
  StoreIcon,
} from '../components/Icons.jsx'
import {
  deleteOffer,
  deleteRequest,
  errorMessage,
  getOffers,
  getProfile,
  getRequests,
  openConversation,
} from '../services/index.js'
import { useT } from '../i18n/index.jsx'
import { listContainerFor, spring, tapSmall } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import { filterListings } from '../utils.js'
import log from '../logger.js'
import useIncrementalList from '../useIncrementalList.js'
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
  const [searchParams, setSearchParams] = useSearchParams()

  const [other, setOther] = useState(null)
  const [tab, setTab] = useState('offers')
  const [query, setQuery] = useState('')
  const [offers, setOffers] = useState(null)
  const [requests, setRequests] = useState(null)
  const [followers, setFollowers] = useState(0)
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [opening, setOpening] = useState(false)
  // O'chirishni tasdiqlash oynasi uchun kutilayotgan e'lon.
  const [pendingDelete, setPendingDelete] = useState(null)

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
        getOffers({ owner_id: profile.id }),
        getRequests({ owner_id: profile.id }),
      ])
      setOffers(a)
      setRequests(r)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setOffers([])
      setRequests([])
    }
  }, [profile?.id, t])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  const remove = async (item, kind) => {
    setPendingDelete(null)
    try {
      if (kind === 'offer') {
        await deleteOffer(item.id)
        setOffers((prev) => prev.filter((x) => x.id !== item.id))
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

  /*
   * Ro'yxat hisob-kitobi va hooklar erta return'lardan OLDIN turishi shart —
   * aks holda ular ba'zi renderlarda chaqirilib, ba'zilarida chaqirilmay
   * qolardi (React hook qoidasi buziladi).
   */
  const list = tab === 'offers' ? offers : requests
  const kind = tab === 'offers' ? 'offer' : 'request'
  const searching = query.trim().length > 0
  // Qidiruv mijoz tomonida — ochiq tabdagi e'lonlar mahsulot nomi bo'yicha filtrlanadi.
  const shown = useMemo(
    () => (list === null ? null : filterListings(list, query, ['product'])),
    [list, query],
  )
  const rendered = useIncrementalList(shown)

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

  const postsCount =
    offers && requests ? offers.length + requests.length : profile.total_listings_count ?? 0

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
        subtitle={isOwn ? t('profile.subtitle') : undefined}
        backTo={userId ? '/' : undefined}
        backLabel={t('common.back')}
        actions={
          isOwn ? (
            <motion.button
              type="button"
              className="topbar-btn"
              whileTap={tapSmall}
              onClick={() => navigate('/sozlamalar')}
              aria-label={t('settings.title')}
            >
              <SettingsIcon size={17} />
            </motion.button>
          ) : null
        }
      />

      <main className="page">
        {shownAlert && <div className="alert">{shownAlert}</div>}

        <div className="profile-grid">
          {/* ---------------------------- Profil boshi ---------------------------- */}
          <div className="profile-aside">
            <motion.section
              className="profile-head"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ph-id">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={spring}
                >
                  <Avatar name={profile.name} src={profile.avatar_url} size={56} />
                </motion.div>

                <div className="ph-who">
                  <h2 className="ph-name">{profile.name}</h2>
                  {profile.address && <p className="ph-address">{profile.address}</p>}
                </div>
              </div>

              {/* Ko'rsatkichlar — chegara bilan ajratilgan uchta katak. */}
              <div className="ph-stats">
                {stats.map((st) =>
                  st.to ? (
                    <motion.button
                      key={st.key}
                      type="button"
                      className="ph-stat"
                      whileTap={tapSmall}
                      onClick={() => navigate(st.to)}
                    >
                      <span className="ph-stat-value num">{st.value}</span>
                      <span className="ph-stat-label">{st.label}</span>
                    </motion.button>
                  ) : (
                    <div key={st.key} className="ph-stat">
                      <span className="ph-stat-value num">{st.value}</span>
                      <span className="ph-stat-label">{st.label}</span>
                    </div>
                  ),
                )}
              </div>

              <div className="ph-actions">
                {isOwn ? (
                  <motion.button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    whileTap={tapSmall}
                    onClick={() => navigate('/sozlamalar/profil')}
                  >
                    {t('profile.edit')}
                  </motion.button>
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
                      {opening ? <span className="spinner dark" /> : <MessageIcon size={14} />}
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
            <div className="tabs" role="tablist">
              {[
                { id: 'offers', label: t('profile.myOffers'), Icon: StoreIcon },
                { id: 'requests', label: t('profile.myRequests'), Icon: ClipboardIcon },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === opt.id}
                  className={`tab${tab === opt.id ? ' active' : ''}`}
                  onClick={() => setTab(opt.id)}
                >
                  {tab === opt.id && (
                    <motion.span
                      layoutId="profile-tab"
                      className="tab-ind"
                      transition={spring}
                    />
                  )}
                  <span>
                    <opt.Icon size={14} />
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <SearchBar value={query} onChange={setQuery} placeholder={t('search.profile')} />

            {/* Tab almashuvi — faqat so'nish. Ilgari `y` ham surilardi, lekin
                tablar balandligi har xil: kontent siljib, keyin qayta joylashib
                sakrardi. Endi bir joyda tinch almashadi. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'linear' }}
              >
                {list === null && (
                  <div className="card-grid">
                    <ListingSkeleton count={2} />
                  </div>
                )}

                {shown !== null && shown.length === 0 && searching && (
                  <EmptyState
                    icon={SearchIcon}
                    title={t('search.noResults')}
                    text={t('search.noResultsHint')}
                  />
                )}

                {list !== null && list.length === 0 && !searching && (
                  <EmptyState
                    icon={tab === 'offers' ? StoreIcon : ClipboardIcon}
                    title={t('profile.noListings')}
                    action={
                      isOwn ? (
                        <motion.button
                          type="button"
                          className="btn btn-primary"
                          whileTap={tapSmall}
                          onClick={() =>
                            navigate(tab === 'offers' ? '/takliflar/yangi' : '/sorovlar/yangi')
                          }
                        >
                          {t(tab === 'offers' ? 'offers.new' : 'requests.new')}
                        </motion.button>
                      ) : null
                    }
                  />
                )}

                {shown !== null && shown.length > 0 && (
                  <motion.div
                    className="card-grid"
                    variants={listContainerFor(shown.length)}
                    initial="initial"
                    animate="animate"
                  >
                    {rendered.map((item) => (
                      <ListingCard
                        key={item.id}
                        item={item}
                        kind={kind}
                        onEdit={
                          isOwn
                            ? (it) =>
                                navigate(
                                  kind === 'offer'
                                    ? `/takliflar/${it.id}/tahrir`
                                    : `/sorovlar/${it.id}/tahrir`,
                                )
                            : undefined
                        }
                        onDelete={isOwn ? (it) => setPendingDelete({ item: it, kind }) : undefined}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('common.confirmDelete')}
        text={pendingDelete?.item.product}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={() => remove(pendingDelete.item, pendingDelete.kind)}
        onCancel={() => setPendingDelete(null)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
