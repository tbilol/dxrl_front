import { useState } from 'react'
import Lightbox from '../listing/Lightbox.jsx'
import {
  ArchiveIcon,
  DownloadFileIcon,
  FileIcon,
  PlayIcon,
  SheetIcon,
} from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { fileFamily, formatSize, KIND } from '../../chat/media.js'
import { formatDuration } from '../../chat/voice.js'

/** Fayl oilasiga mos ikonka. */
const FAMILY_ICON = { archive: ArchiveIcon, sheet: SheetIcon, doc: FileIcon, other: FileIcon }

/**
 * Xabardagi media: rasmlar to'ri, video yoki fayl kartasi.
 *
 * Rasmlar Telegramdagidek joylashadi: bitta — to'liq kenglikda, 2–4 tasi
 * to'rda, 5 va undan ko'pi bo'lsa oxirgisida "+N" yozuvi.
 */
export default function MediaBubble({ items, mine, progress }) {
  const t = useT()
  const [zoom, setZoom] = useState(-1)

  const images = items.filter((i) => i.kind === KIND.IMAGE)
  const videos = items.filter((i) => i.kind === KIND.VIDEO)
  const files = items.filter((i) => i.kind === KIND.FILE)

  const shown = images.slice(0, 4)
  const extra = images.length - shown.length

  const download = (att) => {
    const link = document.createElement('a')
    link.href = att.url
    link.download = att.name || 'fayl'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="media">
      {/* ------------------------------ Rasmlar ------------------------------ */}
      {shown.length > 0 && (
        <div className={`media-grid is-${Math.min(shown.length, 4)}`}>
          {shown.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="media-cell"
              onClick={() => setZoom(i)}
              aria-label={t('listing.openPhoto', { n: i + 1 })}
            >
              <img src={img.url} alt="" loading="lazy" />
              {i === shown.length - 1 && extra > 0 && (
                <span className="media-more" aria-hidden="true">
                  +{extra}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------- Video ------------------------------- */}
      {videos.map((video) => (
        <VideoCell key={video.id} item={video} />
      ))}

      {/* ------------------------------- Fayllar ----------------------------- */}
      {files.map((file) => {
        const Icon = FAMILY_ICON[fileFamily(file)] ?? FileIcon
        return (
          <div key={file.id} className="media-file">
            <span className="media-file-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className="media-file-body">
              <span className="media-file-name">{file.name}</span>
              <span className="media-file-size num">{formatSize(file.size)}</span>
            </span>
            <button
              type="button"
              className="media-file-dl"
              onClick={() => download(file)}
              aria-label={t('messages.download')}
            >
              <DownloadFileIcon size={17} />
            </button>
          </div>
        )
      })}

      {/* --------------------------- Yuklash holati -------------------------- */}
      {progress != null && progress < 100 && (
        <div className="media-progress" role="progressbar" aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
          <em className="num">{progress}%</em>
        </div>
      )}

      {zoom >= 0 && (
        <Lightbox images={images} index={zoom} onIndex={setZoom} onClose={() => setZoom(-1)} />
      )}
    </div>
  )
}

/** Video: bosilgunicha muqova va ▶, keyin oddiy <video> boshqaruvi bilan. */
function VideoCell({ item }) {
  const t = useT()
  const [playing, setPlaying] = useState(false)

  return (
    <div className="media-video">
      {playing ? (
        <video src={item.url} controls autoPlay playsInline />
      ) : (
        <button
          type="button"
          className="media-video-cover"
          onClick={() => setPlaying(true)}
          aria-label={t('messages.play')}
        >
          {/* Muqova sifatida videoning birinchi kadri. */}
          <video src={item.url} preload="metadata" muted playsInline />
          <span className="media-play" aria-hidden="true">
            <PlayIcon size={22} />
          </span>
          {item.duration > 0 && (
            <span className="media-duration num">{formatDuration(item.duration * 1000)}</span>
          )}
        </button>
      )}
    </div>
  )
}
