import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import BoardStats from '../components/BoardStats.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Fab from '../components/Fab.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Toast from '../components/Toast.jsx'
import { ListingSkeleton } from '../components/Skeletons.jsx'
import { CalculatorIcon, ClipboardIcon, SearchIcon, StoreIcon } from '../components/Icons.jsx'
import { errorMessage, getOffers, getRequests } from '../services/index.js'
import { useT } from '../i18n/index.jsx'
import { listContainerFor, tapSmall } from '../motion.js'
import { limitFor, reachedLimit } from '../plans.js'
import useCurrentUser from '../currentUser.jsx'
import { filterListings } from '../utils.js'
import log from '../logger.js'
import useIncrementalList from '../useIncrementalList.js'
import useLogMount from '../useLogMount.js'

/** Takliflar va so'rovlar ro'yxati — bitta komponent, `kind` bilan farqlanadi. */
export default function ListingListPage({ kind }) {
  useLogMount('ListingListPage')
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useCurrentUser()
  const isOffer = kind === 'offer'

  /* Forma "E'lon joylashtirildi" xabarini shu yerda ko'rsatadi — u
     ro'yxatga qaytgandan keyin chiqishi kerak. */
  const [toast, setToast] = useState(location.state?.toast ?? '')
  useEffect(() => {
    if (!location.state?.toast) return
    // Xabar bir marta ko'rsatiladi: orqaga qaytilsa takrorlanmaydi.
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  const [items, setItems] = useState(null)
  const [query, setQuery] = useState('')
  const [alert, setAlert] = useState('')
  // Yangi e'longa to'siq bo'lgan holat: 'verify' | 'limit' | null.
  const [blocked, setBlocked] = useState(null)
  // Sahifa olib tashlangach kelgan javob holatni o'zgartirmasligi kerak.
  const activeRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const data = isOffer ? await getOffers() : await getRequests()
      if (!activeRef.current) return
      setItems(data)
      log.front(`${isOffer ? 'Takliflar' : "So'rovlar"} yuklandi`, { count: data.length })
      setAlert('')
    } catch (err) {
      if (!activeRef.current) return
      setAlert(errorMessage(err, t))
      log.front.error("Ro'yxatni yuklab bo'lmadi", err)
      setItems([])
    }
  }, [isOffer, t])

  useEffect(() => {
    activeRef.current = true
    load()
    return () => {
      activeRef.current = false
    }
  }, [load])

  // Qidiruv mijoz tomonida: mahsulot, e'lon egasi va manzil bo'yicha.
  const shown = useMemo(() => (items ? filterListings(items, query) : null), [items, query])
  // Sanoq va bo'sh holat tekshiruvlari to'liq ro'yxat bo'yicha, chizish esa
  // bo'lak-bo'lak — birinchi kadr hech qachon uzun ro'yxatga bog'lanmaydi.
  const rendered = useIncrementalList(shown)
  const searching = query.trim().length > 0

  const newTo = isOffer ? '/takliflar/yangi' : '/sorovlar/yangi'
  const newLabel = t(isOffer ? 'offers.new' : 'requests.new')

  /* Foydalanuvchining shu doskadagi e'lonlari — tarif chegarasi uchun.
     Qo'shimcha so'rov yo'q: sanoq ko'rinib turgan ro'yxatdan olinadi. */
  const myCount = user && items ? items.filter((it) => it.owner_id === user.id).length : 0

  /**
   * "Yangi e'lon" tugmasi bosilganda: avval kirish, keyin (dehqonlar
   * doskasida) e-ijara tasdig'i, so'ng tarif chegarasi tekshiriladi.
   */
  const startNew = () => {
    if (!user) {
      navigate('/kirish')
      return
    }
    if (isOffer && !user.is_verified_farmer) {
      setBlocked('verify')
      return
    }
    if (reachedLimit(user, kind, myCount)) {
      setBlocked('limit')
      return
    }
    navigate(newTo)
  }

  return (
    <PageShell width="list">
      <Header
        title={t(isOffer ? 'offers.title' : 'requests.title')}
        subtitle={t(isOffer ? 'offers.subtitle' : 'requests.subtitle')}
        actions={
          /* Super kalkulyator — faqat dehqonlar doskasida (Premium xususiyati). */
          isOffer ? (
            <motion.button
              type="button"
              className="topbar-btn"
              whileTap={tapSmall}
              onClick={() => navigate('/kalkulyator')}
              aria-label={t('calc.title')}
              title={t('calc.title')}
            >
              <CalculatorIcon size={18} />
            </motion.button>
          ) : null
        }
      />

      <PullToRefresh onRefresh={load}>
        <main className="page">
          {alert && <div className="alert">{alert}</div>}

          {/* Statistika paneli — bosilganda shu doskaning statistikasi ochiladi. */}
          <BoardStats
            items={items}
            kind={kind}
            to={isOffer ? '/statistika/dehqon' : '/statistika/sotuvchi'}
          />

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={t(isOffer ? 'search.offers' : 'search.requests')}
          />

          {/* Ro'yxat ustidagi qator: nechta e'lon ko'rsatilmoqda. */}
          {shown !== null && shown.length > 0 && (
            <div className="list-bar">
              <span className="list-count">
                {t(isOffer ? 'offers.count' : 'requests.count', { count: shown.length })}
              </span>
            </div>
          )}

          {items === null && (
            <div className="card-grid">
              <ListingSkeleton />
            </div>
          )}

          {/* Qidiruv natija bermadi. */}
          {shown !== null && shown.length === 0 && searching && !alert && (
            <EmptyState
              icon={SearchIcon}
              title={t('search.noResults')}
              text={t('search.noResultsHint')}
            />
          )}

          {/* Ro'yxat bo'sh (qidiruvsiz). */}
          {items !== null && items.length === 0 && !searching && !alert && (
            <EmptyState
              icon={isOffer ? StoreIcon : ClipboardIcon}
              title={t(isOffer ? 'offers.empty' : 'requests.empty')}
              text={t(isOffer ? 'offers.emptyHint' : 'requests.emptyHint')}
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
                <ListingCard key={item.id} item={item} kind={kind} />
              ))}
            </motion.div>
          )}
        </main>
      </PullToRefresh>

      {/* Yangi e'lon — butun ekrandagi yagona "qo'shish" tugmasi.
          <Fab> o'zini <body> ga portal qiladi (izohi Fab.jsx da). */}
      <Fab onClick={startNew} label={newLabel} />

      {/* E-ijara tasdig'i talab qilinadi (faqat dehqonlar doskasi). */}
      <ConfirmDialog
        open={blocked === 'verify'}
        title={t('verify.neededTitle')}
        text={t('verify.neededText')}
        confirmLabel={t('verify.submit')}
        onConfirm={() => {
          setBlocked(null)
          navigate('/tasdiqlash')
        }}
        onCancel={() => setBlocked(null)}
      />

      {/* Tarif chegarasi tugadi — Premium taklif qilinadi. */}
      <ConfirmDialog
        open={blocked === 'limit'}
        title={t('plan.limitTitle')}
        text={t('plan.limitText', { limit: limitFor(user, kind) })}
        confirmLabel={t('plan.seePlans')}
        onConfirm={() => {
          setBlocked(null)
          navigate('/premium')
        }}
        onCancel={() => setBlocked(null)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
