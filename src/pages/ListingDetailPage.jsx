import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Toast from '../components/Toast.jsx'
import ImageCarousel from '../components/listing/ImageCarousel.jsx'
import ImageGallery from '../components/listing/ImageGallery.jsx'
import ListingCard from '../components/ListingCard.jsx'
import Rating from '../components/Rating.jsx'
import { PremiumBadge, VerifiedBadge } from '../components/PlanBadges.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AlertIcon,
  CalendarIcon,
  HandshakeIcon,
  HeartIcon,
  MapPinIcon,
  MessageIcon,
  PhoneCallIcon,
  ScaleIcon,
  ShareIcon,
  TagIcon,
} from '../components/Icons.jsx'
import {
  createTransaction,
  errorMessage,
  getOffer,
  getOffers,
  getRequest,
  getRequests,
  openConversation,
} from '../services/index.js'
import { localizeProduct } from '../data/products.js'
import { useLanguage } from '../i18n/index.jsx'
import { imagesOf, useListingImages } from '../listings/images.js'
import { isFavorite, toggleFavorite, useFavorites } from '../listings/favorites.js'
import { tapSmall } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import useMediaQuery from '../useMediaQuery.js'
import { formatDate, formatNumber, parseDate, ROLE_KEYS } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

const SIMILAR_LIMIT = 6

/**
 * E'lon tafsiloti — Uzum Market uslubidagi mahsulot sahifasi.
 *
 * Mobilda bitta ustun: rasmlar → asosiy ma'lumot → tavsif → batafsil →
 * o'xshash e'lonlar, va pastda doim ko'rinib turadigan aloqa paneli.
 *
 * 768px dan kengda ikki ustun: chapda galereya (asosiy rasm + kichik
 * rasmlar), o'ngda ma'lumot va sotuvchi kartasi; o'xshash e'lonlar esa
 * pastda butun kenglik bo'ylab.
 */
export default function ListingDetailPage({ kind }) {
  useLogMount('ListingDetailPage')
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()
  useListingImages()
  useFavorites()
  // 768px dan kengda karusel o'rniga kichik rasmlar qatori bo'lgan galereya.
  const wide = useMediaQuery('(min-width: 768px)')

  const isOffer = kind === 'offer'
  const [item, setItem] = useState(null)
  const [similar, setSimilar] = useState([])
  const [alert, setAlert] = useState('')
  const [opening, setOpening] = useState(false)
  const [starting, setStarting] = useState(false)
  const [toast, setToast] = useState('')
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    let active = true
    const fetcher = isOffer ? getOffer : getRequest
    fetcher(id)
      .then((data) => {
        if (!active) return
        setItem(data)
        log.front("E'lon yuklandi", { id, product: data.product, kind })
      })
      .catch((err) => {
        if (!active) return
        setAlert(errorMessage(err, t))
        log.front.error("E'lonni yuklab bo'lmadi", err)
      })
    return () => {
      active = false
    }
  }, [id, isOffer, kind, t])

  /* O'xshash e'lonlar — shu mahsulot bo'yicha, mijoz tomonida tanlanadi. */
  useEffect(() => {
    if (!item?.product) return undefined
    let active = true
    const fetcher = isOffer ? getOffers : getRequests
    fetcher()
      .then((list) => {
        if (!active) return
        const key = item.product.toLowerCase()
        setSimilar(
          list
            .filter((it) => it.id !== item.id && String(it.product).toLowerCase() === key)
            .slice(0, SIMILAR_LIMIT),
        )
      })
      .catch(() => {
        /* o'xshashlar ikkinchi darajali — jim o'tkazamiz */
      })
    return () => {
      active = false
    }
  }, [item?.id, item?.product, isOffer])

  const images = useMemo(() => (item ? imagesOf(item) : []), [item])

  const backTo = isOffer ? '/' : '/sorovlar'
  const price = item ? (isOffer ? item.price : item.offer_price) : null
  const ownerName = item ? (isOffer ? item.farmer_name : item.buyer_name) : ''
  const isMine = Boolean(user && item?.owner_id && user.id === item.owner_id)
  const canMessage = Boolean(user && item?.owner_id && !isMine)

  const startChat = async () => {
    setOpening(true)
    try {
      const conv = await openConversation(item.owner_id)
      log.chat('Suhbat ochildi', { conversationId: conv.id, with: item.owner_id })
      navigate(`/xabarlar/${conv.id}`)
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.chat.error("Suhbatni ochib bo'lmadi", err)
      setOpening(false)
    }
  }

  /**
   * Bitim (tranzaksiya) boshlash — ikki tomon kelishgandan keyin.
   * MOCK: eskrov oqimi services/mock/transactions.js da.
   */
  const startDeal = async () => {
    setStarting(true)
    try {
      const tx = await createTransaction({ listing_id: item.id })
      log.front('Tranzaksiya boshlandi (MOCK)', { id: tx.id })
      navigate(`/tranzaksiya/${tx.id}`)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setStarting(false)
    }
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: item.product, url })
      else {
        await navigator.clipboard.writeText(url)
        setToast(t('listing.linkCopied'))
      }
    } catch {
      /* foydalanuvchi bekor qildi */
    }
  }

  const report = () => {
    setReporting(false)
    // TODO: Connect to backend — shikoyatlar uchun endpoint yo'q.
    log.front('E\'lon ustidan shikoyat', { id })
    setToast(t('listing.reportSent'))
  }

  /* ------------------------------ Holatlar ------------------------------ */

  if (alert && !item) {
    return (
      <PageShell variant="slide" width="full">
        <Header title={t('listing.detailTitle')} backTo={backTo} backLabel={t('common.back')} />
        <main className="page pd-state">
          <EmptyState icon={AlertIcon} title={t('listing.notFound')} text={alert} />
        </main>
      </PageShell>
    )
  }

  if (!item) {
    return (
      <PageShell variant="slide" width="full">
        <Header title={t('listing.detailTitle')} backTo={backTo} backLabel={t('common.back')} />
        <main className="page pd-state">
          <BlockSkeleton height={230} />
          <div style={{ height: 16 }} />
          <BlockSkeleton height={180} />
        </main>
      </PageShell>
    )
  }

  const saved = isFavorite(item.id)
  const created = parseDate(item.created_at)

  /* Aloqa tugmalari bitta marta tayyorlanadi: mobilda pastda qotgan
     panelda, 768px dan kengda esa sotuvchi kartasi ichida ko'rsatiladi. */
  const contactButtons = (
    <>
      <motion.button
        type="button"
        className="btn btn-fire"
        whileTap={tapSmall}
        onClick={startChat}
        disabled={!canMessage || opening}
      >
        {opening ? <span className="spinner" /> : <MessageIcon size={16} />}
        {t('listing.sendMessage')}
      </motion.button>

      <motion.a
        className="btn btn-secondary"
        whileTap={tapSmall}
        href={item.phone ? `tel:${String(item.phone).replace(/\s/g, '')}` : undefined}
        aria-disabled={!item.phone}
      >
        <PhoneCallIcon size={16} />
        {t('listing.call')}
      </motion.a>

      {/* Kelishuvdan keyin: eskrov orqali bitim. */}
      <motion.button
        type="button"
        className="btn btn-ghost"
        whileTap={tapSmall}
        onClick={startDeal}
        disabled={!canMessage || starting}
      >
        {starting ? <span className="spinner dark" /> : <HandshakeIcon size={16} />}
        {t('tx.start')}
      </motion.button>
    </>
  )

  const details = [
    { key: 'date', icon: CalendarIcon, label: t('listing.date'), value: formatDate(item.created_at, lang) },
    { key: 'id', icon: TagIcon, label: t('listing.number'), value: `#${String(item.id).slice(0, 8)}` },
    {
      key: 'views',
      icon: null,
      label: t('listing.views'),
      // TODO: Connect to backend — serverda ko'rishlar hisoblagichi yo'q.
      value: item.views_count != null ? formatNumber(item.views_count) : '—',
    },
    { key: 'status', icon: null, label: t('listing.status'), badge: true },
  ]

  return (
    <PageShell variant="slide" width="full">
      <Header
        title={t('listing.detailTitle')}
        backTo={backTo}
        backLabel={t('common.back')}
        actions={
          <>
            <motion.button
              type="button"
              className={`topbar-btn${saved ? ' is-saved' : ''}`}
              whileTap={tapSmall}
              onClick={() => toggleFavorite(item.id)}
              aria-pressed={saved}
              aria-label={t(saved ? 'listing.unsave' : 'listing.save')}
            >
              <HeartIcon size={18} filled={saved} />
            </motion.button>
            <motion.button
              type="button"
              className="topbar-btn"
              whileTap={tapSmall}
              onClick={share}
              aria-label={t('listing.share')}
            >
              <ShareIcon size={17} />
            </motion.button>
          </>
        }
      />

      <main className="page page-flush has-sticky-foot pd-page">
        {alert && (
          <div className="alert" style={{ margin: '0 var(--s-4) var(--s-4)' }}>
            {alert}
          </div>
        )}

        <div className="pd-layout">
          {/* -------------------------- 3A. Rasmlar -------------------------- */}
          <div className="pd-gallery">
            {wide ? (
              <ImageGallery images={images} product={item.product} />
            ) : (
              <ImageCarousel images={images} product={item.product} />
            )}
          </div>

          <div className="detail-body">
            {/* ---------------------- 3B. Asosiy ma'lumot ---------------------- */}
            <section className="pd-head">
              <div className="pd-top">
                <h1 className="pd-name">{localizeProduct(item.product, lang)}</h1>
                <span className={`kind-tag${isOffer ? '' : ' request'}`}>
                  {t(isOffer ? 'offers.one' : 'requests.one')}
                </span>
              </div>

              <div className="pd-price">
                {price ? (
                  <>
                    <span className="pd-price-value num">{formatNumber(price * 1000)}</span>
                    <span className="pd-price-unit">{t('units.somPerTon')}</span>
                  </>
                ) : (
                  <span className="pd-price-value is-soft">{t('listing.negotiable')}</span>
                )}
              </div>

              <ul className="pd-facts">
                <li>
                  <ScaleIcon size={15} />
                  <span className="num">
                    {formatNumber(item.quantity)} {t('units.ton')}
                  </span>
                </li>
                <li>
                  <MapPinIcon size={15} />
                  <span>{item.address || t('common.notSet')}</span>
                </li>
              </ul>
            </section>

            {/* ------------------------- 3C. Tavsif --------------------------- */}
            {item.notes && (
              <section className="pd-section">
                <h2 className="pd-section-title">{t('listing.description')}</h2>
                <p className="pd-notes">{item.notes}</p>
              </section>
            )}

            {/* --------------------- 3D. Batafsil ma'lumot -------------------- */}
            <section className="pd-section">
              <h2 className="pd-section-title">{t('listing.details')}</h2>
              <div className="pd-rows">
                {details.map((row) => (
                  <div key={row.key} className="pd-row">
                    <span className="pd-row-key">{row.label}</span>
                    {row.badge ? (
                      <span className="badge badge-success">{t('listing.statusActive')}</span>
                    ) : (
                      <span className="pd-row-value num">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* -------------------- 3E. Sotuvchi haqida ----------------------- */}
            <section className="pd-section">
              <h2 className="pd-section-title">
                {t(isOffer ? 'listing.seller' : 'listing.buyer')}
              </h2>

              {/* Mobilda bu qism oddiy karta (`display: contents`), desktopda esa
                  sotuvchi + aloqa tugmalari bitta panelga birlashadi. */}
              <div className="pd-owner-box">
                <button
                  type="button"
                  className="pd-seller"
                  onClick={() => item.owner?.id && navigate(`/profile/${item.owner.id}`)}
                  disabled={!item.owner?.id}
                >
                  <Avatar name={item.owner?.name || ownerName} src={item.owner?.avatar_url} size={46} />
                  <span className="pd-seller-body">
                    <span className="pd-seller-name">
                      {item.owner?.name || ownerName}
                      {item.owner?.is_premium && <PremiumBadge compact />}
                      {item.owner?.is_verified_farmer && isOffer && <VerifiedBadge compact />}
                    </span>
                    <Rating value={item.owner?.rating} size="lg" stars />
                    <span className="pd-seller-meta">
                      {item.owner?.role ? t(ROLE_KEYS[item.owner.role] || 'role.dehqon') : ''}
                      {item.address ? ` · ${item.address}` : ''}
                    </span>
                    {created && (
                      <span className="pd-seller-meta">
                        {t('listing.listedOn', { date: formatDate(item.created_at, lang) })}
                      </span>
                    )}
                  </span>
                </button>

                <div className="pd-cta">{contactButtons}</div>
              </div>
            </section>
          </div>

          <div className="pd-extra">
            {/* ------------------- 4. O'xshash e'lonlar ----------------------- */}
            {similar.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section-title">{t('listing.similar')}</h2>
                <div className="pd-similar">
                  {similar.map((it) => (
                    <div key={it.id} className="pd-similar-item">
                      <ListingCard item={it} kind={kind} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ------------------------ Shikoyat qilish ----------------------- */}
            <button type="button" className="pd-report" onClick={() => setReporting(true)}>
              {t('listing.report')}
            </button>
          </div>
        </div>
      </main>

      {/* ------------------- Aloqa paneli — pastda qotgan ------------------ */}
      <div className="pd-foot">{contactButtons}</div>

      <ConfirmDialog
        open={reporting}
        title={t('listing.reportConfirm')}
        text={t('listing.reportHint')}
        confirmLabel={t('listing.report')}
        danger
        onConfirm={report}
        onCancel={() => setReporting(false)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
