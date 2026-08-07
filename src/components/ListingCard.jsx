import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import { CalendarIcon, EditIcon, MapPinIcon, ScaleIcon, TrashIcon, UserIcon } from './Icons.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { listItem, tap, tapSmall } from '../motion.js'
import { formatDate, formatNumber } from '../utils.js'

/**
 * Auksion yoki so'rov kartasi. Bosilganda tafsilot sahifasiga o'tadi.
 * `actions` — "mening e'lonlarim" ro'yxatida tahrirlash/o'chirish tugmalari.
 */
export default function ListingCard({ item, kind, onEdit, onDelete }) {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const isAuction = kind === 'auction'
  const name = isAuction ? item.farmer_name : item.buyer_name
  const price = isAuction ? item.price : item.offer_price
  const to = isAuction ? `/auksion/${item.id}` : `/sorovlar/${item.id}`
  const showActions = Boolean(onEdit || onDelete)

  return (
    <motion.div variants={listItem} layout>
      <motion.div
        className="card listing-card"
        whileTap={tap}
        onClick={() => navigate(to)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(to)
          }
        }}
      >
        <div className="listing-top">
          <span className={`product-chip${isAuction ? '' : ' accent'}`}>{item.product}</span>

          <div className="listing-price">
            {price ? (
              <>
                <span className="price">{formatNumber(price)}</span>
                <span className="unit">{t('units.somPerKg')}</span>
              </>
            ) : (
              <span className="badge badge-muted">{t('listing.negotiable')}</span>
            )}
          </div>
        </div>

        <div className="listing-meta">
          <span className="meta-item">
            <ScaleIcon size={15} />
            <span className="num">
              {formatNumber(item.quantity)} {t('units.ton')}
            </span>
          </span>

          {item.address && (
            <span className="meta-item">
              <MapPinIcon size={15} />
              <span>{item.address}</span>
            </span>
          )}

          <span className="meta-item">
            <CalendarIcon size={15} />
            <span>{formatDate(item.created_at, lang)}</span>
          </span>
        </div>

        {item.notes && <p className="listing-notes">{item.notes}</p>}

        <div className="listing-owner">
          {item.owner ? (
            <Avatar name={item.owner.name} src={item.owner.avatar_url} size={24} />
          ) : (
            <UserIcon size={15} />
          )}
          <span>{item.owner?.name || name}</span>
        </div>

        {showActions && (
          <div
            className="btn-row"
            style={{ marginTop: 'var(--sp-3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <motion.button
                type="button"
                className="btn btn-ghost btn-sm"
                whileTap={tapSmall}
                onClick={() => onEdit(item)}
              >
                <EditIcon size={15} /> {t('common.edit')}
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                type="button"
                className="btn btn-danger btn-sm"
                whileTap={tapSmall}
                onClick={() => onDelete(item)}
              >
                <TrashIcon size={15} /> {t('common.delete')}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
