import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import CoverImage from './listing/CoverImage.jsx'
import {
  EditIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  TrashIcon,
  UserIcon,
  VideoIcon,
} from './Icons.jsx'
import { localizeProduct } from '../data/products.js'
import { useLanguage } from '../i18n/index.jsx'
import { cardHover, cardTap, listItem, tapSmall } from '../motion.js'
import { imagesOf, useListingImages } from '../listings/images.js'
import { isFavorite, toggleFavorite, useFavorites } from '../listings/favorites.js'
import { formatDayShort, formatNumber, parseDate } from '../utils.js'

/**
 * Bozor kartasi: taklif yoki so'rov. Bosilganda tafsilot sahifasiga o'tadi.
 *
 * Tuzilishi: yuqorida rasm (taxminan 45%), pastda ma'lumot (55%) —
 * nomi, narxi, miqdori, manzili; eng pastda e'lon egasi va sanasi.
 * `onEdit`/`onToggleStatus`/`onDelete` — "mening e'lonlarim" ro'yxatidagi
 * qo'shimcha qator. Boshqa hollarda rasm ustida "saqlash" (yurakcha) bor.
 */
export default function ListingCard({ item, kind, onEdit, onToggleStatus, onDelete }) {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  // Sessiyadagi rasmlarni ham kuzatamiz (hozircha server rasm bermaydi).
  useListingImages()
  useFavorites()
  const cover = imagesOf(item)[0] ?? null

  const isOffer = kind === 'offer'
  // So'nggi 48 soatda joylangan e'lonlar "Yangi" nishonini oladi.
  const created = parseDate(item.created_at)
  const isNew = Boolean(created && Date.now() - created.getTime() < 48 * 3600 * 1000)
  const name = isOffer ? item.farmer_name : item.buyer_name
  // Narx bazada kg uchun saqlanadi; kartada ham, tafsilotda ham tonna bo'yicha.
  const price = isOffer ? item.price : item.offer_price
  const to = isOffer ? `/takliflar/${item.id}` : `/sorovlar/${item.id}`
  const showActions = Boolean(onEdit || onToggleStatus || onDelete)
  const saved = isFavorite(kind, item.id)
  // Yopilgan e'lon faqat egasining profilida ko'rinadi (doskada emas).
  const isClosed = item.status === 'closed'

  /* `layout` ataylab ishlatilmaydi: to'rdagi kartalar joyini almashtirmaydi,
     lekin layout-proyeksiya `listItem` variantidagi `y` bilan bir xususiyat
     ustida kurashib, paydo bo'lishda titrashga sabab bo'lardi. */
  return (
    <motion.article
      variants={listItem}
      className={`lcard${isClosed ? ' is-closed' : ''}`}
      whileHover={cardHover}
      whileTap={cardTap}
    >
      <div
        className="lcard-hit"
        role="link"
        tabIndex={0}
        onClick={() => navigate(to)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            navigate(to)
          }
        }}
      >
        {/* Muqova: rasm bo'lsa o'sha, bo'lmasa mahsulot rangidagi o'rin.
            Balandligi ikkalasida bir xil — to'r buzilmaydi. */}
        <div className="lcard-media">
          <CoverImage src={cover?.url} product={item.product} className="is-card" />
          {isClosed ? (
            <span className="new-badge lcard-new is-closed">{t('listing.statusClosed')}</span>
          ) : (
            isNew && <span className="new-badge lcard-new">{t('listing.new')}</span>
          )}
          {/* Saqlash — karta bosilishi (tafsilotga o'tish) bilan to'qnashmasin. */}
          {!showActions && (
            <motion.button
              type="button"
              className={`lcard-save${saved ? ' is-saved' : ''}`}
              whileTap={tapSmall}
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(kind, item.id)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              aria-pressed={saved}
              aria-label={t(saved ? 'listing.unsave' : 'listing.save')}
            >
              <HeartIcon size={15} filled={saved} />
            </motion.button>
          )}
          {/* MOCK: e'londagi qisqa video (fayl hali yuklanmaydi). */}
          {item.has_video && (
            <span className="lcard-video" title={t('listing.video')}>
              <VideoIcon size={13} />
            </span>
          )}
        </div>

        <div className="lcard-body">
          {/* Nom bazada kanonik (o'zbekcha) saqlanadi — ko'rsatishda tarjima
              qilinadi (src/data/products.js). */}
          <h3 className="lcard-title">{localizeProduct(item.product, lang)}</h3>

          {/* Narx bloki — kartaning asosiy raqami. */}
          <p className="lcard-price">
            {price ? (
              <>
                <span className="lcard-amount num">{formatNumber(price * 1000)}</span>
                <span className="lcard-unit">{t('units.somPerTonShort')}</span>
              </>
            ) : (
              <span className="lcard-negotiable">{t('listing.negotiable')}</span>
            )}
          </p>

          <p className="lcard-line">
            <ScaleIcon size={13} />
            <span className="num">
              {formatNumber(item.quantity)} {t('units.ton')}
            </span>
          </p>

          <p className="lcard-line is-muted">
            <MapPinIcon size={13} />
            <span>{item.address || t('common.notSet')}</span>
          </p>

          {item.phone && (
            <p className="lcard-line is-muted">
              <PhoneIcon size={13} />
              <span className="num">{item.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Pastki qator: chapda e'lon egasi, o'ngda joylangan sana. */}
      <footer className="lcard-foot">
        {item.owner ? (
          <button
            type="button"
            className="lcard-owner is-link"
            onClick={() => navigate(`/profile/${item.owner.id}`)}
          >
            <Avatar name={item.owner.name} src={item.owner.avatar_url} size={18} />
            <span>{item.owner.name}</span>
          </button>
        ) : (
          <span className="lcard-owner">
            <UserIcon size={13} />
            <span>{name}</span>
          </span>
        )}

        <time className="lcard-date" dateTime={created ? created.toISOString() : undefined}>
          {formatDayShort(item.created_at, lang)}
        </time>
      </footer>

      {showActions && (
        <div className="lcard-actions">
          {onEdit && (
            <motion.button
              type="button"
              className="btn btn-ghost btn-xs"
              whileTap={tapSmall}
              onClick={() => onEdit(item)}
            >
              <EditIcon size={14} /> {t('common.edit')}
            </motion.button>
          )}
          {onToggleStatus && (
            <motion.button
              type="button"
              className="btn btn-ghost btn-xs"
              whileTap={tapSmall}
              onClick={() => onToggleStatus(item)}
            >
              {t(isClosed ? 'listing.reopenShort' : 'listing.closeShort')}
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              type="button"
              className="btn btn-ghost btn-xs is-danger"
              whileTap={tapSmall}
              onClick={() => onDelete(item)}
              aria-label={t('common.delete')}
            >
              <TrashIcon size={14} />
            </motion.button>
          )}
        </div>
      )}
    </motion.article>
  )
}
