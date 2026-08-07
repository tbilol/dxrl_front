import { initials } from '../utils.js'

export default function Avatar({ name, src, size = 44, className = '' }) {
  return (
    <div
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src ? (
        <img src={src} alt={name || ''} referrerPolicy="no-referrer" loading="lazy" />
      ) : (
        initials(name)
      )}
    </div>
  )
}
