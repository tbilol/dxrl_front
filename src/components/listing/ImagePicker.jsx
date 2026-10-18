import { useEffect, useRef, useState } from 'react'
import { CameraIcon, PlusIcon, XIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { MAX_IMAGES, makeImage, releaseImage, validateImage } from '../../listings/images.js'

/**
 * E'longa rasm qo'shish — 5 tagacha.
 *
 * Tanlangan rasmlar darhol ko'rinadi (URL.createObjectURL), gorizontal
 * qatorda siljiydi. Har birida "✕" tugmasi, birinchisida "Asosiy" yozuvi —
 * u karta va tafsilot sahifasida muqova bo'lib turadi.
 */
export default function ImagePicker({ images, onChange }) {
  const t = useT()
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  // Komponent olib tashlanganda havolalar bo'shatiladi.
  useEffect(
    () => () => {
      images.forEach(releaseImage)
    },
    // Faqat unmount'da — ro'yxat o'zgarganda emas (aks holda ko'rinayotgan
    // rasm ham o'chib ketardi).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const pick = (event) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    if (!files.length) return

    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setError(t('listing.imageMax', { count: MAX_IMAGES }))
      return
    }

    const accepted = []
    let problem = ''
    for (const file of files.slice(0, room)) {
      const bad = validateImage(file)
      if (bad) {
        problem = t(bad)
        continue
      }
      accepted.push(makeImage(file))
    }

    if (files.length > room && !problem) problem = t('listing.imageMax', { count: MAX_IMAGES })
    setError(problem)
    if (accepted.length) onChange([...images, ...accepted])
  }

  const remove = (image) => {
    releaseImage(image)
    onChange(images.filter((i) => i.id !== image.id))
    setError('')
  }

  const full = images.length >= MAX_IMAGES

  return (
    <div className="field">
      <span className="field-label">
        {t('listing.photos')}
        <span className="field-optional">{t('common.optional')}</span>
      </span>

      <div className="imgpick">
        {images.map((image, i) => (
          <div key={image.id} className="imgpick-item">
            <img src={image.url} alt="" loading="lazy" />
            {i === 0 && <span className="imgpick-main">{t('listing.mainPhoto')}</span>}
            <button
              type="button"
              className="imgpick-remove"
              onClick={() => remove(image)}
              aria-label={t('common.delete')}
            >
              <XIcon size={13} />
            </button>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            className="imgpick-add"
            onClick={() => inputRef.current?.click()}
            aria-label={t('listing.addPhoto')}
          >
            {images.length === 0 ? <CameraIcon size={22} /> : <PlusIcon size={20} />}
            <span>
              {images.length}/{MAX_IMAGES}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={pick}
      />

      <p className={`field-msg${error ? ' is-error' : ''}`} role={error ? 'alert' : undefined}>
        {error || t('listing.photosHint', { count: MAX_IMAGES })}
      </p>
    </div>
  )
}
