import { useEffect, useRef, useState } from 'react'
import { MicIcon, TrashIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { formatDuration, isRecordingSupported, startRecording, WAVE_BARS } from '../../chat/voice.js'

/**
 * Bosib turib ovoz yozish tugmasi (Telegramdagidek).
 *
 * Bosib turilganda: qizil pulsatsiyalanuvchi nuqta, o'suvchi taymer, jonli
 * to'lqin va "Bekor qilish uchun suring" yozuvi ko'rinadi. Chapga ~90px
 * surilsa yozuv bekor qilinadi, qo'yib yuborilsa yuboriladi.
 *
 * To'lqin ustunlari to'g'ridan-to'g'ri DOM da yangilanadi (React holati
 * emas) — sekundiga ~18 marta qayta render qilish oqimni sekinlashtirardi.
 */

const CANCEL_AT = -90

export default function VoiceRecorder({ onRecorded, onError, disabled }) {
  const t = useT()
  const supported = isRecordingSupported()

  const [active, setActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [cancelling, setCancelling] = useState(false)

  const sessionRef = useRef(null)
  const barsRef = useRef([])
  const startXRef = useRef(0)
  const timerRef = useRef(null)
  const cancelRef = useRef(false)

  useEffect(() => () => {
    clearInterval(timerRef.current)
    sessionRef.current?.cancel()
  }, [])

  const pushLevel = (level) => {
    // Ustunlarni chapga suramiz — oxirgi qiymat o'ngda paydo bo'ladi.
    const bars = barsRef.current
    if (!bars.length) return
    for (let i = 0; i < bars.length - 1; i += 1) {
      bars[i].style.transform = bars[i + 1].style.transform || 'scaleY(0.08)'
    }
    const last = bars[bars.length - 1]
    if (last) last.style.transform = `scaleY(${Math.max(0.08, level)})`
  }

  const begin = async (clientX) => {
    if (disabled || active || !supported) return
    startXRef.current = clientX
    cancelRef.current = false
    setCancelling(false)
    setElapsed(0)

    try {
      sessionRef.current = await startRecording({ onLevel: pushLevel })
    } catch (err) {
      onError?.(err)
      return
    }

    setActive(true)
    const startedAt = Date.now()
    timerRef.current = setInterval(() => setElapsed(Date.now() - startedAt), 200)
  }

  const move = (clientX) => {
    if (!active) return
    const dx = clientX - startXRef.current
    const willCancel = dx < CANCEL_AT
    cancelRef.current = willCancel
    setCancelling(willCancel)
  }

  const finish = async () => {
    if (!active) return
    clearInterval(timerRef.current)
    setActive(false)
    setCancelling(false)

    const session = sessionRef.current
    sessionRef.current = null
    if (!session) return

    if (cancelRef.current) {
      session.cancel()
      return
    }

    const clip = await session.stop()
    // Juda qisqa bosishlar — tasodifiy tegish, yubormaymiz.
    if (clip.durationMs < 600) {
      URL.revokeObjectURL(clip.url)
      return
    }
    onRecorded(clip)
  }

  if (!supported) return null

  return (
    <>
      <button
        type="button"
        className={`chat-mic${active ? ' is-recording' : ''}`}
        aria-label={t('messages.holdToRecord')}
        disabled={disabled}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          begin(e.clientX)
        }}
        onPointerMove={(e) => move(e.clientX)}
        onPointerUp={finish}
        onPointerCancel={finish}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MicIcon size={18} />
      </button>

      {active && (
        <div className={`rec-bar${cancelling ? ' is-cancelling' : ''}`}>
          <span className="rec-dot" aria-hidden="true" />
          <span className="rec-time num">{formatDuration(elapsed)}</span>

          <span className="rec-wave" aria-hidden="true">
            {Array.from({ length: WAVE_BARS }).map((_, i) => (
              <i
                key={i}
                ref={(node) => {
                  barsRef.current[i] = node
                }}
                style={{ transform: 'scaleY(0.08)' }}
              />
            ))}
          </span>

          <span className="rec-hint">
            {cancelling ? (
              <>
                <TrashIcon size={13} />
                {t('messages.releaseToCancel')}
              </>
            ) : (
              t('messages.slideToCancel')
            )}
          </span>
        </div>
      )}
    </>
  )
}
