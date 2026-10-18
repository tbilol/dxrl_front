import { useEffect, useRef, useState } from 'react'
import MediaBubble from './MediaBubble.jsx'
import VoiceBubble from './VoiceBubble.jsx'
import { CheckOneIcon, CheckTwoIcon, ReplyIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { REACTIONS } from '../../chat/store.js'
import { formatTime } from '../../utils.js'

/**
 * Bitta xabar pufakchasi.
 *
 * Ikkita imo-ishora bor va ular bir-biriga xalaqit bermaydi:
 *   · o'ngga surish (> 56px)  → javob berish
 *   · uzoq bosish (450ms)     → reaksiya tanlash
 * Barmoq 8px dan ko'proq siljisa uzoq bosish bekor qilinadi, shuning uchun
 * surish paytida reaksiya oynasi ochilib ketmaydi.
 *
 * Surish faqat `transform` bilan (kompozitor qatlami) — maket qayta
 * hisoblanmaydi.
 */

const REPLY_AT = 56
const HOLD_MS = 450

/** Yuborilgan / yetkazilgan / o'qilgan belgilari. */
function Ticks({ status }) {
  const t = useT()
  if (status === 'sending') {
    return (
      <span className="tick" aria-label={t('messages.statusSending')}>
        <CheckOneIcon size={13} />
      </span>
    )
  }
  return (
    <span
      className={`tick${status === 'read' ? ' is-read' : ''}`}
      aria-label={t(status === 'read' ? 'messages.statusRead' : 'messages.statusDelivered')}
    >
      <CheckTwoIcon size={14} />
    </span>
  )
}

export default function MessageBubble({
  message,
  mine,
  status,
  voice,
  media,
  progress,
  reply,
  reaction,
  onReply,
  onReact,
}) {
  const t = useT()
  const rowRef = useRef(null)
  const holdRef = useRef(null)
  const startRef = useRef(null)
  const draggingRef = useRef(false)
  const [picker, setPicker] = useState(false)

  useEffect(() => () => clearTimeout(holdRef.current), [])

  // Reaksiya oynasi ochiq bo'lsa — tashqariga bosilganda yopiladi.
  useEffect(() => {
    if (!picker) return undefined
    const close = (e) => {
      if (!rowRef.current?.contains(e.target)) setPicker(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [picker])

  const shift = (px) => {
    if (rowRef.current) rowRef.current.style.transform = `translateX(${px}px)`
  }

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startRef.current = { x: e.clientX, y: e.clientY }
    draggingRef.current = false
    holdRef.current = setTimeout(() => {
      if (!draggingRef.current) setPicker(true)
    }, HOLD_MS)
  }

  const onPointerMove = (e) => {
    const start = startRef.current
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y

    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      clearTimeout(holdRef.current)
    }
    // Faqat gorizontal, faqat o'ngga.
    if (dx > 8 && Math.abs(dy) < 24) {
      draggingRef.current = true
      shift(Math.min(dx * 0.55, REPLY_AT + 12))
    }
  }

  const onPointerUp = (e) => {
    clearTimeout(holdRef.current)
    const start = startRef.current
    startRef.current = null
    shift(0)
    if (!start || !draggingRef.current) return
    if (e.clientX - start.x > REPLY_AT) onReply(message)
    draggingRef.current = false
  }

  return (
    <div className={`bubble-row${mine ? ' mine' : ''}`}>
      {/* Surilganda orqada ko'rinadigan javob belgisi. */}
      <span className="bubble-reply-hint" aria-hidden="true">
        <ReplyIcon size={15} />
      </span>

      <div
        ref={rowRef}
        className="bubble-drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className={`bubble ${mine ? 'mine' : 'theirs'}${voice ? ' is-voice' : ''}${
            media ? ' is-media' : ''
          }`}
        >
          {reply && (
            <span className="bubble-quote">
              <span className="bubble-quote-who">
                {reply.mine ? t('messages.you') : t('messages.peer')}
              </span>
              <span className="bubble-quote-text">{reply.preview}</span>
            </span>
          )}

          {media && <MediaBubble items={media} mine={mine} progress={progress} />}

          {voice ? (
            <VoiceBubble clip={voice} mine={mine} />
          ) : (
            /* Media bilan birga kelgan matn — izoh sifatida ostida turadi. */
            message.content && <span className="bubble-text">{message.content}</span>
          )}

          <span className="msg-meta">
            <span className="msg-time">{formatTime(message.created_at)}</span>
            {mine && <Ticks status={status} />}
          </span>
        </div>

        {reaction && (
          <button
            type="button"
            className="bubble-reaction"
            onClick={() => onReact(message.id, reaction)}
            aria-label={t('messages.reaction')}
          >
            {reaction}
          </button>
        )}

        {picker && (
          <div className="react-bar" role="menu">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                className={`react-key${reaction === emoji ? ' is-on' : ''}`}
                onClick={() => {
                  onReact(message.id, emoji)
                  setPicker(false)
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
