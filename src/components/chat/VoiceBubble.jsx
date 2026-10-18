import { useEffect, useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { formatDuration, nextSpeed } from '../../chat/voice.js'

/**
 * Ovozli xabar pufakchasi: ijro tugmasi, to'lqin, davomiylik va tezlik.
 *
 * To'lqin ijro davomida to'ladi. To'ldirish React holati bilan emas, CSS
 * o'zgaruvchisi orqali qilinadi — sekundiga 60 marta render qilmaslik uchun.
 * To'lqinning istalgan joyiga bosib, o'sha nuqtaga o'tish mumkin.
 */
export default function VoiceBubble({ clip, mine }) {
  const t = useT()
  const audioRef = useRef(null)
  const waveRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [shownMs, setShownMs] = useState(clip.durationMs)

  // Tezlik o'zgarsa darhol qo'llanadi (ijro to'xtamaydi).
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    let frame = null
    const paint = () => {
      const total = audio.duration && Number.isFinite(audio.duration)
        ? audio.duration * 1000
        : clip.durationMs
      const pct = total > 0 ? Math.min(1, (audio.currentTime * 1000) / total) : 0
      waveRef.current?.style.setProperty('--played', String(pct))
      setShownMs(Math.max(0, total - audio.currentTime * 1000))
      if (!audio.paused) frame = requestAnimationFrame(paint)
    }

    const onPlay = () => {
      setPlaying(true)
      frame = requestAnimationFrame(paint)
    }
    const onStop = () => {
      setPlaying(false)
      if (frame) cancelAnimationFrame(frame)
    }
    const onEnd = () => {
      onStop()
      waveRef.current?.style.setProperty('--played', '0')
      setShownMs(clip.durationMs)
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onStop)
    audio.addEventListener('ended', onEnd)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onStop)
      audio.removeEventListener('ended', onEnd)
    }
  }, [clip.durationMs])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }

  /** To'lqinga bosilganda o'sha nuqtaga o'tamiz. */
  const seek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    const box = e.currentTarget.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width))
    const total = Number.isFinite(audio.duration) ? audio.duration : clip.durationMs / 1000
    audio.currentTime = total * pct
    waveRef.current?.style.setProperty('--played', String(pct))
  }

  return (
    <div className={`voice${mine ? ' mine' : ''}`}>
      <button
        type="button"
        className="voice-play"
        onClick={toggle}
        aria-label={t(playing ? 'messages.pause' : 'messages.play')}
      >
        {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>

      <div className="voice-main">
        {/*
          Ikki qatlam: pastda xira to'lqin, ustida yorqin nusxasi. Yorqin
          qatlam `clip-path` bilan qirqiladi — ijro davomida faqat shu
          xususiyat o'zgaradi, ya'ni maket ham, bo'yash ham qayta
          hisoblanmaydi.
        */}
        <div
          className="voice-wave"
          ref={waveRef}
          style={{ '--played': 0 }}
          onClick={seek}
          role="presentation"
        >
          <span className="voice-wave-layer" aria-hidden="true">
            {clip.wave.map((level, i) => (
              <i key={i} style={{ height: `${Math.round(level * 100)}%` }} />
            ))}
          </span>
          <span className="voice-wave-layer is-played" aria-hidden="true">
            {clip.wave.map((level, i) => (
              <i key={i} style={{ height: `${Math.round(level * 100)}%` }} />
            ))}
          </span>
        </div>

        <div className="voice-foot">
          <span className="voice-time num">{formatDuration(shownMs)}</span>
          <button
            type="button"
            className="voice-speed num"
            onClick={() => setSpeed(nextSpeed(speed))}
            aria-label={t('messages.speed')}
          >
            {String(speed).replace('.', ',')}x
          </button>
        </div>
      </div>

      {/* preload="metadata" — davomiylik darhol ma'lum bo'ladi. */}
      <audio ref={audioRef} src={clip.url} preload="metadata" />
    </div>
  )
}
