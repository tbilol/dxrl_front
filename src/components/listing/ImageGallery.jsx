import { useEffect, useState } from 'react'
import CoverImage from './CoverImage.jsx'
import Lightbox from './Lightbox.jsx'
import { useT } from '../../i18n/index.jsx'

/**
 * Katta ekran uchun rasm galereyasi: tepada asosiy rasm, pastda kichik
 * rasmlar qatori.
 *
 * Rasmlar bir-birining ustida turadi va faqat shaffofligi o'zgaradi —
 * shuning uchun almashish silliq (crossfade) bo'ladi va yangi rasm
 * yuklanguncha bo'sh joy ko'rinmaydi. Asosiy rasmga bosilsa to'liq ekran.
 */
export default function ImageGallery({ images, product }) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(-1)

  // Boshqa e'longa o'tilganda birinchi rasmga qaytamiz.
  const count = images.length
  useEffect(() => {
    setIndex(0)
  }, [count])

  if (!count) return <CoverImage product={product} className="is-hero" />

  const active = Math.min(index, count - 1)

  return (
    <div className="gallery">
      <button
        type="button"
        className="gallery-main"
        onClick={() => setZoom(active)}
        aria-label={t('listing.openPhoto', { n: active + 1 })}
      >
        {images.map((image, i) => (
          <img
            key={image.id}
            src={image.url}
            alt=""
            className={i === active ? 'is-on' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </button>

      {count > 1 && (
        <div className="gallery-thumbs">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              className={`gallery-thumb${i === active ? ' is-on' : ''}`}
              onClick={() => setIndex(i)}
              aria-current={i === active}
              aria-label={t('listing.openPhoto', { n: i + 1 })}
            >
              <img src={image.url} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {zoom >= 0 && (
        <Lightbox images={images} index={zoom} onIndex={setZoom} onClose={() => setZoom(-1)} />
      )}
    </div>
  )
}
