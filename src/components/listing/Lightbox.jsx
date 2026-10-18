import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'

/**
 * To'liq ekranli rasm ko'rgich.
 *
 * Barmoq bilan chapga/o'ngga surish, ikki barmoq bilan kattalashtirish
 * (brauzerning o'z `touch-action: pinch-zoom` imkoniyati), Esc bilan yopish.
 * <body> ga portal qilinadi — sahifa qobig'idagi transform uni buzmasligi
 * uchun.
 */
export default function Lightbox({ images, index, onClose, onIndex }) {
  const t = useT()
  const [startX, setStartX] = useState(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex(Math.min(images.length - 1, index + 1))
      if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
    }
    document.addEventListener('keydown', onKey)
    // Orqa fon siljimasin.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [images.length, index, onClose, onIndex])

  const end = (x) => {
    if (startX === null) return
    const dx = x - startX
    setStartX(null)
    if (Math.abs(dx) < 40) return
    onIndex(dx < 0 ? Math.min(images.length - 1, index + 1) : Math.max(0, index - 1))
  }

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true">
      <button type="button" className="lightbox-close" onClick={onClose} aria-label={t('common.close')}>
        <XIcon size={20} />
      </button>

      <div
        className="lightbox-stage"
        onPointerDown={(e) => setStartX(e.clientX)}
        onPointerUp={(e) => end(e.clientX)}
        onPointerCancel={() => setStartX(null)}
      >
        <img src={images[index]?.url} alt="" />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav is-prev"
            onClick={() => onIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label={t('common.prev')}
          >
            <ArrowLeftIcon size={18} />
          </button>
          <button
            type="button"
            className="lightbox-nav is-next"
            onClick={() => onIndex(Math.min(images.length - 1, index + 1))}
            disabled={index === images.length - 1}
            aria-label={t('common.next')}
          >
            <ArrowRightIcon size={18} />
          </button>

          <div className="lightbox-count num">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>,
    document.body,
  )
}
