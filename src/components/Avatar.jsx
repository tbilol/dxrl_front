import { initials } from '../utils.js'

export default function Avatar({ name, src, size = 44, className = '' }) {
  return (
    <div
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {src ? (
        /* width/height atributlari — rasm kelgunicha ham joy band bo'lib turadi,
           shuning uchun yuklanganda maket siljimaydi. */
        <img
          src={src}
          alt={name || ''}
          width={size}
          height={size}
          decoding="async"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        initials(name)
      )}
    </div>
  )
}
