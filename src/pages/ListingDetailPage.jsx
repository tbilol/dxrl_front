import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
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
import { formatDate, formatNumber, ROLE_KEYS } from '../utils.js'

/** Auksion yoki so'rovning to'liq sahifasi. */
export default function ListingDetailPage({ kind }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()

  const isAuction = kind === 'auction'
  const [item, setItem] = useState(null)
  const [alert, setAlert] = useState('')
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    let active = true
    const fetcher = isAuction ? getAuction : getRequest
    fetcher(id)
      .then((data) => active && setItem(data))
      .catch((err) => active && setAlert(errorMessage(err, t)))
    return () => {
      active = false
    }
  }, [id, isAuction, t])

  const backTo = isAuction ? '/' : '/sorovlar'
  const price = item ? (isAuction ? item.price : item.offer_price) : null
  const ownerName = item ? (isAuction ? item.farmer_name : item.buyer_name) : ''
  const isMine = Boolean(user && item?.owner_id && user.id === item.owner_id)
  const canMessage = Boolean(user && item?.owner_id && !isMine)

  const startChat = async () => {
    setOpening(true)
    try {
      const conv = await openConversation(item.owner_id)
      navigate(`/xabarlar/${conv.id}`)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setOpening(false)
    }
  }

  if (alert && !item) {
    return (
      <PageShell variant="slide">
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
      <PageShell variant="slide">
        <main className="page" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
          <BlockSkeleton height={190} />
          <div style={{ height: 16 }} />
          <BlockSkeleton height={260} />
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell variant="slide">
      <div className={`detail-hero${isAuction ? '' : ' accent'}`}>
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
          {price ? ` · ${formatNumber(price)} ${t('units.somPerKg')}` : ` · ${t('listing.negotiable')}`}
        </motion.div>
      </div>

      <main className="page" style={{ paddingTop: 0 }}>
        {alert && <div className="alert">{alert}</div>}

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
              {isMine
                ? t('listing.yours')
                : t(isAuction ? 'listing.seller' : 'listing.buyer')}
            </div>
          </div>
          {item.owner?.role && (
            <span className={`badge${item.owner.role === 'dehqon' ? '' : ' badge-orange'}`}>
              {t(ROLE_KEYS[item.owner.role] || 'role.dehqon')}
            </span>
          )}
        </motion.div>

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
                {price ? `${formatNumber(price)} ${t('units.somPerKg')}` : t('listing.negotiable')}
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

        <PhoneReveal phone={item.phone} />

        {canMessage && (
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
      </main>
    </PageShell>
  )
}
