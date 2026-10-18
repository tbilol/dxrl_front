/**
 * Ovozli xabarlar uchun quyi qatlam: yozib olish, to'lqin shakli, davomiylik.
 *
 * TODO: Upload voice messages to backend — hozircha serverda fayl saqlash
 * yo'q (`messages.content` — oddiy matn maydoni, 4000 belgigacha). Shuning
 * uchun yozib olingan ovoz faqat joriy sessiyada, brauzer xotirasida
 * saqlanadi: sahifa yangilansa yo'qoladi. Backendda multipart endpoint
 * (masalan `POST /api/conversations/{id}/voice`) paydo bo'lgach,
 * `saveClip()` o'rniga o'sha chaqiriladi.
 */

/** Brauzer qo'llab-quvvatlaydigan birinchi format. */
function pickMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  if (typeof MediaRecorder === 'undefined') return null
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

export function isRecordingSupported() {
  return Boolean(
    typeof MediaRecorder !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      pickMimeType(),
  )
}

/** To'lqin shakli uchun ustunlar soni (pufakcha kengligiga mos). */
export const WAVE_BARS = 40

/**
 * Mikrofonni ochadi va yozishni boshlaydi.
 *
 * `onLevel(level)` — 0..1 oralig'idagi joriy ovoz balandligi (jonli to'lqin
 * uchun), taxminan har 60ms da chaqiriladi.
 *
 * Qaytaradi: { stop, cancel } — `stop()` klip qaytaradi, `cancel()` esa
 * hech narsa saqlamay mikrofonni yopadi.
 */
export async function startRecording({ onLevel } = {}) {
  const mimeType = pickMimeType()
  if (!mimeType) throw new Error('MediaRecorder qo\'llab-quvvatlanmaydi')

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks = []
  recorder.addEventListener('dataavailable', (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data)
  })

  /* Jonli daraja — AnalyserNode orqali. Bu faqat ko'rsatish uchun, yozuvga
     ta'sir qilmaydi. */
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  source.connect(analyser)
  const buffer = new Uint8Array(analyser.frequencyBinCount)
  const levels = []

  let frame = null
  let lastEmit = 0
  const tick = (now) => {
    analyser.getByteTimeDomainData(buffer)
    // O'rtacha kvadrat qiymat (RMS) — 0..1.
    let sum = 0
    for (let i = 0; i < buffer.length; i += 1) {
      const v = (buffer[i] - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / buffer.length)
    const level = Math.min(1, rms * 3.2)

    if (now - lastEmit > 55) {
      lastEmit = now
      levels.push(level)
      onLevel?.(level)
    }
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)

  const startedAt = Date.now()

  const teardown = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    stream.getTracks().forEach((track) => track.stop())
    ctx.close().catch(() => {})
  }

  recorder.start(100)

  return {
    /** Yozishni tugatib, klipni qaytaradi. */
    stop: () =>
      new Promise((resolve) => {
        recorder.addEventListener(
          'stop',
          () => {
            teardown()
            const blob = new Blob(chunks, { type: mimeType })
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              durationMs: Date.now() - startedAt,
              wave: normalizeWave(levels),
              mimeType,
            })
          },
          { once: true },
        )
        recorder.stop()
      }),

    /** Bekor qilish — hech narsa saqlanmaydi. */
    cancel: () => {
      try {
        recorder.stop()
      } catch {
        /* allaqachon to'xtagan */
      }
      teardown()
    },
  }
}

/**
 * O'lchangan darajalarni WAVE_BARS ta ustunga siqadi va 0.08..1 oralig'iga
 * keltiradi (juda past ustunlar ko'rinmay qolmasligi uchun).
 */
export function normalizeWave(levels) {
  if (!levels.length) return new Array(WAVE_BARS).fill(0.15)

  const out = []
  const step = levels.length / WAVE_BARS
  for (let i = 0; i < WAVE_BARS; i += 1) {
    const from = Math.floor(i * step)
    const to = Math.max(from + 1, Math.floor((i + 1) * step))
    let peak = 0
    for (let j = from; j < to && j < levels.length; j += 1) {
      if (levels[j] > peak) peak = levels[j]
    }
    out.push(peak)
  }

  const max = Math.max(...out, 0.001)
  return out.map((v) => 0.08 + (v / max) * 0.92)
}

/** "0:07" ko'rinishidagi davomiylik. */
export function formatDuration(ms) {
  const total = Math.max(0, Math.round((Number(ms) || 0) / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Tezlik tugmasi ketma-ketligi: 1 → 1.5 → 2 → 0.5 → 1 */
export const SPEEDS = [1, 1.5, 2, 0.5]

export function nextSpeed(current) {
  const i = SPEEDS.indexOf(current)
  return SPEEDS[(i + 1) % SPEEDS.length]
}
