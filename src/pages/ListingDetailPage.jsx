import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Toast from '../components/Toast.jsx'
import ImageCarousel from '../components/listing/ImageCarousel.jsx'
import ImageGallery from '../components/listing/ImageGallery.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AlertIcon,
  CalendarIcon,
  EditIcon,
  HeartIcon,
  MapPinIcon,
  MessageIcon,
  PhoneCallIcon,
  ScaleIcon,
  ShareIcon,
  TagIcon,
} from '../components/Icons.jsx'
import {
  deleteOffer,
  deleteRequest,
  errorMessage,
  getOffer,
  getOffers,
  getRequest,
  getRequests,
  openConversation,
  updateOffer,
  updateRequest,
} from '../services/index.js'
import { localizeProduct } from '../data/products.js'
import { useLanguage } from '../i18n/index.jsx'
import { imagesOf, useListingImages } from '../listings/images.js'
import { isFavorite, toggleFavorite, useFavorites } from '../listings/favorites.js'
import { tapSmall } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import useMediaQuery from '../useMediaQuery.js'
import { formatDate, formatNumber, parseDate } from '../utils.js'
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
  const location = useLocation()
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
  const [phoneShown, setPhoneShown] = useState(false)
  const [toggling, setToggling] = useState(false)
  // Tahrirlash formasi "E'lon yangilandi" xabarini shu yerga yuboradi.
  const [toast, setToast] = useState(location.state?.toast ?? '')
  const [reporting, setReporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!location.state?.toast) return
    // Xabar bir marta ko'rsatiladi: orqaga qaytilsa takrorlanmaydi.
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

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
  const isActive = (item?.status ?? 'active') === 'active'

  const startChat = async () => {
    if (!user) {
      navigate('/kirish')
      return
    }
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
   * E'lonni yopish / qayta faollashtirish — faqat egasi uchun.
   * Chegara faqat faol e'lonlarni sanaydi, shuning uchun yopilgan e'lon
   * o'rniga yangisini joylashtirish mumkin.
   */
  const toggleStatus = async () => {
    setToggling(true)
    try {
      const next = isActive ? 'closed' : 'active'
      const updated = await (isOffer ? updateOffer : updateRequest)(item.id, { status: next })
      setItem(updated)
      setToast(t(next === 'closed' ? 'listing.closedToast' : 'listing.reopenedToast'))
      log.front("E'lon holati o'zgardi", { id: item.id, status: next })
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setToggling(false)
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

  const remove = async () => {
    setDeleting(false)
    try {
      await (isOffer ? deleteOffer : deleteRequest)(item.id)
      log.front("E'lon o'chirildi", { id: item.id, kind })
      navigate('/profil', { replace: true, state: { toast: t('listing.deleted') } })
    } catch (err) {
      setAlert(errorMessage(err, t))
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

  const saved = isFavorite(kind, item.id)
  const created = parseDate(item.created_at)

  /* Aloqa tugmalari bitta marta tayyorlanadi: mobilda pastda qotgan
     panelda, 768px dan kengda esa sotuvchi kartasi ichida ko'rsatiladi. */
  const phoneHref = item.phone ? `tel:${String(item.phone).replace(/\s/g, '')}` : undefined

  /* Egasi uchun: tahrirlash va yopish. Boshqalar uchun: chat va telefon —
     ikki tomon to'g'ridan-to'g'ri bog'lanadi. */
  const contactButtons = isMine ? (
    <>
      <motion.button
        type="button"
        className="btn btn-secondary"
        whileTap={tapSmall}
        onClick={() => navigate(isOffer ? `/takliflar/${item.id}/tahrir` : `/sorovlar/${item.id}/tahrir`)}
      >
        <EditIcon size={16} />
        {t('common.edit')}
      </motion.button>
      <motion.button
        type="button"
        className={`btn ${isActive ? 'btn-ghost' : 'btn-primary'}`}
        whileTap={tapSmall}
        onClick={toggleStatus}
        disabled={toggling}
      >
        {toggling && <span className={`spinner${isActive ? ' dark' : ''}`} />}
        {t(isActive ? 'listing.close' : 'listing.reopen')}
      </motion.button>
    </>
  ) : (
    <>
      <motion.button
        type="button"
        className="btn btn-fire"
        whileTap={tapSmall}
        onClick={startChat}
        disabled={!item.owner_id || opening}
      >
        {opening ? <span className="spinner" /> : <MessageIcon size={16} />}
        {t('listing.sendMessage')}
      </motion.button>

      {/* Raqam birinchi bosishda ochiladi, ikkinchisida qo'ng'iroq qilinadi. */}
      {phoneShown && phoneHref ? (
        <motion.a className="btn btn-secondary" whileTap={tapSmall} href={phoneHref}>
          <PhoneCallIcon size={16} />
          <span className="num">{item.phone}</span>
        </motion.a>
      ) : (
        <motion.button
          type="button"
          className="btn btn-secondary"
          whileTap={tapSmall}
          onClick={() => setPhoneShown(true)}
          disabled={!item.phone}
        >
          <PhoneCallIcon size={16} />
          {t('listing.showPhone')}
        </motion.button>
      )}
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
              onClick={() => toggleFavorite(kind, item.id)}
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
                      <span className={`badge${isActive ? ' badge-success' : ''}`}>
                        {t(isActive ? 'listing.statusActive' : 'listing.statusClosed')}
                      </span>
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
                    <span className="pd-seller-name">{item.owner?.name || ownerName}</span>
                    {item.address && <span className="pd-seller-meta">{item.address}</span>}
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

            {/* ----------- O'chirish (egasi) yoki shikoyat (boshqalar) ----------- */}
            {isMine ? (
              <button type="button" className="pd-report" onClick={() => setDeleting(true)}>
                {t('listing.delete')}
              </button>
            ) : (
              <button type="button" className="pd-report" onClick={() => setReporting(true)}>
                {t('listing.report')}
              </button>
            )}
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

      <ConfirmDialog
        open={deleting}
        title={t('common.confirmDelete')}
        text={t('listing.deleteHint')}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={remove}
        onCancel={() => setDeleting(false)}
      />

      <Toast message={toast} onDone={() => setToast('')} />
    </PageShell>
  )
}
