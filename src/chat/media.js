/**
 * Chatdagi media: rasm, video va fayllar.
 *
 * TODO: Implement file upload to backend — serverda fayl saqlash yo'q
 * (`messages.content` — oddiy matn maydoni). Shuning uchun tanlangan
 * fayllar joriy sessiyada, brauzer xotirasida qoladi va suhbatdosh
 * ularni ko'rmaydi. Yuklash jarayoni namoyish uchun taqlid qilinadi.
 */

export const MAX_ITEMS = 10
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024
export const MAX_FILE_BYTES = 50 * 1024 * 1024

export const KIND = { IMAGE: 'image', VIDEO: 'video', FILE: 'file' }

export function kindOf(file) {
  if (file.type.startsWith('image/')) return KIND.IMAGE
  if (file.type.startsWith('video/')) return KIND.VIDEO
  return KIND.FILE
}

/** Xato bo'lsa tarjima kaliti, aks holda null. */
export function validate(file) {
  const kind = kindOf(file)
  if (kind === KIND.IMAGE && file.size > MAX_IMAGE_BYTES) return 'listing.imageSizeError'
  if (kind === KIND.VIDEO && file.size > MAX_VIDEO_BYTES) return 'messages.videoSizeError'
  if (kind === KIND.FILE && file.size > MAX_FILE_BYTES) return 'messages.fileSizeError'
  return null
}

/** "2,4 MB" ko'rinishidagi hajm. */
export function formatSize(bytes) {
  const n = Number(bytes) || 0
  if (n >= 1024 * 1024) return `${String(Math.round((n / 1024 / 1024) * 10) / 10).replace('.', ',')} MB`
  if (n >= 1024) return `${Math.round(n / 1024)} KB`
  return `${n} B`
}

/** Fayl turi bo'yicha belgi (ikonka tanlash uchun). */
export function fileFamily(file) {
  const name = String(file?.name ?? '').toLowerCase()
  if (/\.(zip|rar|7z|tar|gz)$/.test(name)) return 'archive'
  if (/\.(xls|xlsx|csv|numbers)$/.test(name)) return 'sheet'
  if (/\.(pdf|doc|docx|rtf|txt|pages)$/.test(name)) return 'doc'
  return 'other'
}

/** Tanlangan fayldan xabar qo'shimchasini yasaydi. */
export function makeAttachment(file) {
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: kindOf(file),
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    file,
  }
}

export function releaseAttachment(att) {
  if (att?.url?.startsWith('blob:')) URL.revokeObjectURL(att.url)
}

/** Videoning davomiyligini metama'lumotdan o'qiydi. */
export function readVideoDuration(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => resolve(Number.isFinite(video.duration) ? video.duration : 0)
    video.onerror = () => resolve(0)
    video.src = url
  })
}

/**
 * Yuklashni taqlid qiladi: 0 dan 100 gacha bosqichma-bosqich.
 * TODO: Implement file upload to backend — bu yerda haqiqiy
 * `POST /api/conversations/{id}/media` (multipart) chaqiriladi va
 * `onProgress` XHR ning `upload.onprogress` hodisasidan olinadi.
 */
export function simulateUpload(onProgress) {
  return new Promise((resolve) => {
    let pct = 0
    const step = () => {
      pct = Math.min(100, pct + 12 + Math.random() * 18)
      onProgress(Math.round(pct))
      if (pct >= 100) setTimeout(resolve, 120)
      else setTimeout(step, 110)
    }
    setTimeout(step, 120)
  })
}
