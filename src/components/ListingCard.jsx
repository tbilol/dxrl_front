import PhoneReveal from './PhoneReveal.jsx'
import { MapPinIcon, UserIcon } from './Icons.jsx'
import { formatDate, formatNumber } from '../utils.js'

/**
 * Auksion va so'rovlar uchun umumiy karta.
 * type: "auction" | "request"
 */
export default function ListingCard({ item, type = 'auction' }) {
  const isAuction = type === 'auction'
  const personName = isAuction ? item.farmer_name : item.buyer_name
  const priceValue = isAuction ? item.price : item.offer_price
  const priceLabel = isAuction ? 'Narxi' : 'Taklif narxi'

  return (
    <article className="card">
      <div className="card-top">
        <span className={`badge${isAuction ? '' : ' badge-orange'}`}>{item.product}</span>
        <span className="card-date">{formatDate(item.created_at)}</span>
      </div>

      <div className="card-person">
        <UserIcon size={17} />
        {personName}
      </div>

      <div className="card-grid">
        <div className="card-cell">
          <div className="label">Miqdori</div>
          <div className="value">
            {formatNumber(item.quantity)}
            <span className="unit">tonna</span>
          </div>
        </div>
        <div className="card-cell">
          <div className="label">{priceLabel}</div>
          <div className="value">
            {formatNumber(priceValue)}
            {priceValue !== null && priceValue !== undefined && (
              <span className="unit">so'm/kg</span>
            )}
          </div>
        </div>
      </div>

      {item.address && (
        <div className="card-address">
          <MapPinIcon size={15} />
          {item.address}
        </div>
      )}

      <PhoneReveal phone={item.phone} />
    </article>
  )
}
