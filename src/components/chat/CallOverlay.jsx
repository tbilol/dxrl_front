import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Avatar from '../Avatar.jsx'
import {
  CameraFlipIcon,
  MicIcon,
  MicOffIcon,
  PhoneCallIcon,
  SpeakerIcon,
  VideoIcon,
  VideoOffIcon,
} from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { CALL } from '../../chat/calls.js'
import { formatDuration } from '../../chat/voice.js'

/**
 * To'liq ekranli qo'ng'iroq oynasi — chiquvchi, kiruvchi va suhbat holatlari.
 *
 * <body> ga portal qilinadi: `position: fixed` element sahifa qobig'i
 * (PageShell) ichида qolsa, o'tish animatsiyasidagi transform uni noto'g'ri
 * joyga qo'yardi.
 *
 * Uzoq masofadagi tasvir hali yo'q (signalizatsiya serveri kerak) — video
 * rejimida o'z kameramiz to'liq ekranda ko'rsatiladi, kichik oynada esa
 * xuddi shu tasvir "pip" sifatida turadi.
 */
export default function CallOverlay({ call, peer, onClose }) {
  const t = useT()
  const localRef = useRef(null)
  const pipRef = useRef(null)

  const { state, kind, muted, cameraOff, speaker, seconds, error } = call
  const visible = state !== CALL.IDLE

  // Oqim tayyor bo'lgach <video> ga ulaymiz.
  useEffect(() => {
    if (!visible || kind !== 'video') return
    const stream = call.stream.current
    if (!stream) return
    for (const node of [localRef.current, pipRef.current]) {
      if (node && node.srcObject !== stream) node.srcObject = stream
    }
  }, [visible, kind, state, call.stream, cameraOff])

  // Ochiq bo'lganda Esc — qo'ng'iroqni tugatadi.
  useEffect(() => {
    if (!visible) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onClose])

  if (!visible) return null

  const statusText = {
    [CALL.OUTGOING]: t('call.calling'),
    [CALL.INCOMING]: t(kind === 'video' ? 'call.incomingVideo' : 'call.incoming'),
    [CALL.ACTIVE]: formatDuration(seconds * 1000),
  }[state]

  const isVideo = kind === 'video'
  const showSelfVideo = isVideo && !cameraOff && state !== CALL.INCOMING

  const overlay = (
    <div className={`call${isVideo ? ' is-video' : ''}`} role="dialog" aria-modal="true">
      {/* Video rejimda: to'liq ekranli tasvir. */}
      {showSelfVideo && state === CALL.ACTIVE && (
        <video ref={localRef} className="call-stage" autoPlay playsInline muted />
      )}

      <div className="call-top">
        <div className={`call-avatar${state === CALL.ACTIVE ? '' : ' is-ringing'}`}>
          <Avatar name={peer?.name} src={peer?.avatar_url} size={112} />
        </div>

        <h2 className="call-name">{peer?.name || t('messages.title')}</h2>
        <p className="call-status num">{statusText}</p>

        {isVideo && state !== CALL.ACTIVE && (
          <span className="call-badge">
            <VideoIcon size={13} />
            {t('call.videoLabel')}
          </span>
        )}

        {error && (
          <p className="call-error">
            {t(error === 'permission' ? 'call.errPermission' : 'call.errDevice')}
          </p>
        )}
      </div>

      {/* Chiquvchi/suhbat holatida o'z kamerangiz kichik oynada. */}
      {showSelfVideo && (
        <div className="call-pip">
          <video ref={pipRef} autoPlay playsInline muted />
        </div>
      )}

      <div className="call-controls">
        {state === CALL.INCOMING ? (
          <>
            <button
              type="button"
              className="call-btn is-decline"
              onClick={onClose}
              aria-label={t('call.decline')}
            >
              {/* Go'shakni "qo'yish" — telefon belgisi 135° ga burilgan. */}
              <span className="call-hangup" aria-hidden="true">
                <PhoneCallIcon size={24} />
              </span>
            </button>
            <button
              type="button"
              className="call-btn is-accept"
              onClick={call.accept}
              aria-label={t('call.accept')}
            >
              <PhoneCallIcon size={24} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`call-btn is-soft${muted ? ' is-on' : ''}`}
              onClick={call.toggleMute}
              aria-pressed={muted}
              aria-label={t('call.mute')}
            >
              {muted ? <MicOffIcon size={20} /> : <MicIcon size={20} />}
            </button>

            {isVideo ? (
              <>
                <button
                  type="button"
                  className={`call-btn is-soft${cameraOff ? ' is-on' : ''}`}
                  onClick={call.toggleCamera}
                  aria-pressed={cameraOff}
                  aria-label={t('call.camera')}
                >
                  {cameraOff ? <VideoOffIcon size={20} /> : <VideoIcon size={20} />}
                </button>
                <button
                  type="button"
                  className="call-btn is-soft"
                  onClick={call.flipCamera}
                  aria-label={t('call.flip')}
                >
                  <CameraFlipIcon size={20} />
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`call-btn is-soft${speaker ? ' is-on' : ''}`}
                onClick={call.toggleSpeaker}
                aria-pressed={speaker}
                aria-label={t('call.speaker')}
              >
                <SpeakerIcon size={20} />
              </button>
            )}

            <button
              type="button"
              className="call-btn is-decline"
              onClick={onClose}
              aria-label={t('call.end')}
            >
              <span className="call-hangup" aria-hidden="true">
                <PhoneCallIcon size={24} />
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
