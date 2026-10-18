import { StarIcon } from './Icons.jsx'

/**
 * Reyting — yulduz va raqam.
 *
 * Kartalarda (`size="sm"`) faqat bitta to'ldirilgan yulduz va qiymat
 * ko'rsatiladi: qator tor va raqam bir qarashda o'qiladi. Profilda beshta
 * yulduz chiziladi.
 */
export default function Rating({ value, count, size = 'sm', stars = false }) {
  const rating = Number(value)
  if (!Number.isFinite(rating) || rating <= 0) return null

  const px = size === 'lg' ? 15 : 12

  return (
    <span className={`rating is-${size}`}>
      {stars ? (
        <span className="rating-stars" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarIcon key={i} size={px} filled={i <= Math.round(rating)} />
          ))}
        </span>
      ) : (
        <StarIcon size={px} filled aria-hidden="true" />
      )}
      <span className="rating-value num">{rating.toFixed(1)}</span>
      {count != null && count > 0 && <span className="rating-count num">({count})</span>}
    </span>
  )
}
