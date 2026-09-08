import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import PageShell from '../components/PageShell.jsx'
import PhoneReveal from '../components/PhoneReveal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AlertIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CoinsIcon,
  MapPinIcon,
  MessageIcon,
  ScaleIcon,
} from '../components/Icons.jsx'
import { errorMessage, getAuction, getRequest, openConversation } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import { spring, tap, tapSmall } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import { useIsDesktop } from '../useMediaQuery.js'
import { formatDate, formatNumber, ROLE_KEYS } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/**
 * Auksion yoki so'rovning to'liq sahifasi.
 * Desktopda: chapda tafsilotlar (60%), o'ngda e'lon egasi, telefon va yozishma (40%).
 */
export default function ListingDetailPage({ kind }) {
  useLogMount('ListingDetailPage')
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()
  const isDesktop = useIsDesktop()

  const isAuction = kind === 'auction'
  const [item, setItem] = useState(null)
  const [alert, setAlert] = useState('')
  const [opening, setOpening] = useState(false)
  const [chatId, setChatId] = useState(null)

  useEffect(() => {
    let active = true
    const fetcher = isAuction ? getAuction : getRequest
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
  }, [id, isAuction, kind, t])

  const backTo = isAuction ? '/' : '/sorovlar'
  const price = item ? (isAuction ? item.price : item.offer_price) : null
  const ownerName = item ? (isAuction ? item.farmer_name : item.buyer_name) : ''
  const isMine = Boolean(user && item?.owner_id && user.id === item.owner_id)
  const canMessage = Boolean(user && item?.owner_id && !isMine)

  /* Desktopda suhbat shu yerda ochiladi, mobilda alohida sahifaga o'tamiz. */
  const startChat = async () => {
    setOpening(true)
    try {
      const conv = await openConversation(item.owner_id)
      log.chat('Suhbat ochildi', {
        conversationId: conv.id,
        with: item.owner_id,
        inline: isDesktop,
      })
      if (isDesktop) {
        setChatId(conv.id)
        setOpening(false)
      } else {
        navigate(`/xabarlar/${conv.id}`)
      }
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.chat.error("Suhbatni ochib bo'lmadi", err)
      setOpening(false)
    }
  }

  if (alert && !item) {
    return (
      <PageShell variant="slide" width="mid">
        <main className="page" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
          <motion.button
            type="button"
            className="icon-btn"
            whileTap={tapSmall}
            onClick={() => navigate(backTo)}
            aria-label={t('common.back')}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
          <EmptyState icon={AlertIcon} title={t('listing.notFound')} text={alert} />
        </main>
      </PageShell>
    )
  }

  if (!item) {
    return (
      <PageShell variant="slide" width="wide">
        <main className="page" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
          <BlockSkeleton height={190} />
          <div style={{ height: 16 }} />
          <BlockSkeleton height={260} />
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell variant="slide" width="wide">
      <div className={`detail-hero${isAuction ? '' : ' accent'}`}>
        <div className="detail-hero-inner">
          <motion.button
            type="button"
            className="back"
            whileTap={tapSmall}
            onClick={() => navigate(backTo)}
            aria-label={t('common.back')}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>

          <motion.h1
            className="detail-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
          >
            {item.product}
          </motion.h1>

          <motion.div
            className="detail-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            {formatNumber(item.quantity)} {t('units.ton')}
            {price
              ? ` · ${formatNumber(price)} ${t('units.somPerKg')}`
              : ` · ${t('listing.negotiable')}`}
          </motion.div>
        </div>
      </div>

      <main className="page" style={{ paddingTop: 0 }}>
        {alert && <div className="alert">{alert}</div>}

        <div className="detail-grid">
          {/* ------------------------- Chap: tafsilotlar ------------------------ */}
          <div className="detail-main">
            <div className="info-list">
              <div className="info-row">
                <ScaleIcon size={19} />
                <div className="body">
                  <div className="k">{t('listing.quantity')}</div>
                  <div className="v num">
                    {formatNumber(item.quantity)} {t('units.ton')}
                  </div>
                </div>
              </div>

              <div className="info-row">
                <CoinsIcon size={19} />
                <div className="body">
                  <div className="k">{t(isAuction ? 'listing.price' : 'listing.offerPrice')}</div>
                  <div className="v num">
                    {price
                      ? `${formatNumber(price)} ${t('units.somPerKg')}`
                      : t('listing.negotiable')}
                  </div>
                </div>
              </div>

              <div className="info-row">
                <MapPinIcon size={19} />
                <div className="body">
                  <div className="k">{t('listing.address')}</div>
                  <div className="v">{item.address || t('common.notSet')}</div>
                </div>
              </div>

              <div className="info-row">
                <CalendarIcon size={19} />
                <div className="body">
                  <div className="k">{t('listing.date')}</div>
                  <div className="v">{formatDate(item.created_at, lang)}</div>
                </div>
              </div>
            </div>

            {item.notes && (
              <motion.div
                className="notes-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
              >
                <span className="k">{t('listing.notes')}</span>
                {item.notes}
              </motion.div>
            )}
          </div>

          {/* --------------------- O'ng: aloqa va yozishma --------------------- */}
          <div className="detail-side">
            <motion.div
              className="detail-owner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Avatar name={item.owner?.name || ownerName} src={item.owner?.avatar_url} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="name">{item.owner?.name || ownerName}</div>
                <div className="role">
                  {isMine ? t('listing.yours') : t(isAuction ? 'listing.seller' : 'listing.buyer')}
                </div>
              </div>
              {item.owner?.role && (
                <span className={`badge${item.owner.role === 'dehqon' ? '' : ' badge-orange'}`}>
                  {t(ROLE_KEYS[item.owner.role] || 'role.dehqon')}
                </span>
              )}
            </motion.div>

            <PhoneReveal phone={item.phone} />

            {canMessage && !chatId && (
              <motion.button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 10 }}
                whileTap={tap}
                onClick={startChat}
                disabled={opening}
              >
                {opening ? <span className="spinner dark" /> : <MessageIcon size={18} />}
                {t('listing.sendMessage')}
              </motion.button>
            )}

            {chatId && (
              <motion.div
                className="chat-embed"
                style={{ marginTop: 12 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
              >
                <ChatPanel conversationId={chatId} other={item.owner} />
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </PageShell>
  )
}
