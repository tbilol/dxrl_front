import { useRef, useState } from 'react'
import CoverImage from './CoverImage.jsx'
import Lightbox from './Lightbox.jsx'
import { useT } from '../../i18n/index.jsx'

/**
 * E'lon rasmlari karuseli.
 *
 * Siljish brauzerning o'z gorizontal scroll'i bilan (`scroll-snap`) —
 * JavaScript bilan surish emas, shuning uchun barmoq ostida tabiiy va
 * hech qachon qotib qolmaydi. Nuqtalar joriy rasmni ko'rsatadi, rasmga
 * bosilsa to'liq ekran ochiladi.
 */
export default function ImageCarousel({ images, product }) {
  const t = useT()
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(-1)

  if (!images.length) {
    return <CoverImage product={product} className="is-hero" />
  }

  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const next = Math.round(track.scrollLeft / track.clientWidth)
    if (next !== index) setIndex(next)
  }

  const goTo = (i) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="carousel">
      <div className="carousel-track" ref={trackRef} onScroll={onScroll}>
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            className="carousel-slide"
            onClick={() => setZoom(i)}
            aria-label={t('listing.openPhoto', { n: i + 1 })}
          >
            <img src={image.url} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="carousel-dots" role="tablist">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`carousel-dot${i === index ? ' is-on' : ''}`}
              onClick={() => goTo(i)}
              aria-label={t('listing.openPhoto', { n: i + 1 })}
            />
          ))}
        </div>
      )}

      {zoom >= 0 && (
        <Lightbox images={images} index={zoom} onIndex={setZoom} onClose={() => setZoom(-1)} />
      )}
    </div>
  )
}
