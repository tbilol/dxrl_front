import { useEffect, useRef, useState } from 'react'
import { FileIcon, ImageIcon, PaperclipIcon, VideoIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'

/**
 * Qo'shimcha fayl tanlash — qisqichcha tugmasi va uning ostidagi menyu.
 * Uchta kirish nuqtasi bir xil `onFiles` ga boradi, faqat `accept` farq qiladi.
 */
export default function AttachMenu({ onFiles, disabled }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  const imageRef = useRef(null)
  const videoRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (event) => {
    const files = [...(event.target.files ?? [])]
    event.target.value = ''
    setOpen(false)
    if (files.length) onFiles(files)
  }

  const options = [
    { key: 'photo', icon: ImageIcon, label: t('messages.attachPhoto'), ref: imageRef },
    { key: 'video', icon: VideoIcon, label: t('messages.attachVideo'), ref: videoRef },
    { key: 'file', icon: FileIcon, label: t('messages.attachFile'), ref: fileRef },
  ]

  return (
    <div className="attach" ref={boxRef}>
      <button
        type="button"
        className={`chat-attach${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={open}
        aria-label={t('messages.attach')}
      >
        <PaperclipIcon size={19} />
      </button>

      {open && (
        <div className="attach-menu" role="menu">
          {options.map(({ key, icon: Icon, label, ref }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              className="attach-item"
              onClick={() => ref.current?.click()}
            >
              <span className="attach-icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              {label}
            </button>
          ))}
        </div>
      )}

      <input ref={imageRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={pick} />
      <input ref={videoRef} type="file" accept="video/*" multiple className="sr-only" tabIndex={-1} onChange={pick} />
      <input ref={fileRef} type="file" multiple className="sr-only" tabIndex={-1} onChange={pick} />
    </div>
  )
}
