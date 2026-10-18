import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import AttachMenu from './chat/AttachMenu.jsx'
import CallOverlay from './chat/CallOverlay.jsx'
import MessageBubble from './chat/MessageBubble.jsx'
import { PremiumBadge } from './PlanBadges.jsx'
import TypingDots from './chat/TypingDots.jsx'
import VoiceRecorder from './chat/VoiceRecorder.jsx'
import { ArrowLeftIcon, PhoneCallIcon, SendIcon, VideoIcon, XIcon } from './Icons.jsx'
import { errorMessage, getMessages, sendMessage } from '../services/index.js'
import useCall from '../chat/calls.js'
import { derivePresence } from '../chat/presence.js'
import {
  attachMedia,
  attachReply,
  attachVoice,
  getMedia,
  getVoice,
  moveMedia,
  moveReply,
  moveVoice,
  releaseVoice,
  setProgress,
  toggleReaction,
  useChatExtras,
} from '../chat/store.js'
import {
  MAX_ITEMS,
  makeAttachment,
  readVideoDuration,
  releaseAttachment,
  simulateUpload,
  validate,
} from '../chat/media.js'
import { formatDuration } from '../chat/voice.js'
import { useLanguage } from '../i18n/index.jsx'
import useCurrentUser from '../currentUser.jsx'
import { formatDayDivider, formatTime, sameDay } from '../utils.js'
import log from '../logger.js'

const POLL_MS = 5000

/**
 * Serverga yuboriladigan matnli belgi — suhbatdosh hech bo'lmasa qanday
 * qo'shimcha kelganini ko'radi (fayllarning o'zi hali yuborilmaydi).
 */
function mediaLabel(items, t) {
  const kinds = new Set(items.map((i) => i.kind))
  if (kinds.size === 1 && kinds.has('image')) return `📷 ${t('messages.kindPhoto')}`
  if (kinds.size === 1 && kinds.has('video')) return `🎥 ${t('messages.kindVideo')}`
  if (kinds.size === 1 && kinds.has('file')) return `📎 ${t('messages.kindFile')}`
  return `📎 ${t('messages.kindMedia')}`
}

/**
 * Yozishmalar paneli — sarlavha, xabarlar oqimi va kiritish qatori.
 *
 * Balandlik ota konteynerdan olinadi (`height: 100%`), shuning uchun kiritish
 * qatori har qanday ekranda pastda qoladi — fixed pozitsiya kerak emas.
 * Mobil klaviatura ochilganda `dvh` birligi tufayli panel o'zi qisqaradi.
 */
export default function ChatPanel({ conversationId, other, onBack }) {
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()
  const navigate = useNavigate()
  const extras = useChatExtras()
  const call = useCall()

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [alert, setAlert] = useState('')
  /** Javob berilayotgan xabar (kiritish qatori ustida ko'rinadi). */
  const [replyTo, setReplyTo] = useState(null)
  /** Yuborishdan oldin tanlangan fayllar (kiritish qatori ustida ko'rinadi). */
  const [pending, setPending] = useState([])
  /**
   * Suhbatdosh yozmoqda.
   * TODO: Connect to realtime backend — serverda "typing" signali yo'q,
   * shuning uchun bu qiymat hozircha hech qachon yoqilmaydi. WebSocket
   * paydo bo'lgach shu holat o'sha yerdan boshqariladi.
   */
  const [peerTyping] = useState(false)

  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)
  const activeRef = useRef(true)

  const load = useCallback(
    async ({ silent } = {}) => {
      try {
        if (silent) log.chat('Yangi xabarlar tekshirilmoqda...', conversationId)
        const data = await getMessages(conversationId)
        if (!activeRef.current) return
        /* Yuborilayotgan (hali javob kelmagan) xabarlar saqlanib qoladi:
           so'rov aynan shu payt qaytsa, pufakcha ko'zdan g'oyib bo'lib,
           keyin qaytadan paydo bo'lardi. */
        setMessages((prev) => {
          const pending = prev.filter((m) => m.pending)
          if (!pending.length) return data
          const known = new Set(data.map((m) => m.id))
          return [...data, ...pending.filter((m) => !known.has(m.id))]
        })
        if (!silent) {
          setAlert('')
          log.chat('Suhbat ochildi', { conversationId, messages: data.length })
        }
      } catch (err) {
        if (!activeRef.current) return
        if (!silent) setAlert(errorMessage(err, t))
        log.chat.error('Xabarlarni yuklab bo\'lmadi', err)
      }
    },
    [conversationId, t],
  )

  useEffect(() => {
    activeRef.current = true
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load({ silent: true })
    }, POLL_MS)
    return () => {
      activeRef.current = false
      clearInterval(timer)
    }
  }, [load])

  // Sahifadan chiqishda ovoz havolalari bo'shatiladi.
  useEffect(() => () => releaseVoice(), [])

  // Yangi xabar kelganda pastga suramiz.
  useEffect(() => {
    const lastId = messages.length ? messages[messages.length - 1].id : null
    if (lastId && lastId !== lastIdRef.current) {
      lastIdRef.current = lastId
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  /* --------------------------- Suhbatdosh holati -------------------------- */

  const presence = useMemo(
    () => derivePresence(messages, other?.id),
    [messages, other?.id],
  )

  const presenceText = presence.online
    ? t('messages.online')
    : presence.lastSeen
      ? t('messages.lastSeen', { time: formatTime(presence.lastSeen.toISOString()) })
      : ''

  /* ------------------------------- Yuborish ------------------------------- */

  /** Optimistik xabar — server javobigacha ro'yxatda turadi. */
  const pushOptimistic = (content) => {
    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user?.id,
        receiver_id: other?.id,
        content,
        is_read: false,
        created_at: new Date().toISOString(),
        pending: true,
      },
    ])
    return tempId
  }

  const finishSend = (tempId, created) => {
    moveVoice(tempId, created.id)
    moveReply(tempId, created.id)
    setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)))
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (sending) return

    // Qo'shimchalar bo'lsa — matn ular uchun izoh bo'lib ketadi.
    if (pending.length) {
      await sendMedia(draft.trim())
      return
    }

    const content = draft.trim()
    if (!content) return

    setSending(true)
    setDraft('')
    const quoted = replyTo
    setReplyTo(null)
    const tempId = pushOptimistic(content)
    if (quoted) attachReply(tempId, quoted)

    try {
      const created = await sendMessage(conversationId, content)
      finishSend(tempId, created)
      log.chat('Xabar yuborildi', { to: other?.id, length: content.length })
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setAlert(errorMessage(err, t))
      setDraft(content) // matn yo'qolmasin
      log.chat.error('Xabar yuborilmadi', err)
    } finally {
      setSending(false)
    }
  }

  /**
   * Ovozli xabar.
   *
   * TODO: Upload voice messages to backend — serverda fayl saqlash yo'q,
   * shuning uchun serverga matnli belgi yuboriladi (suhbatdosh hech
   * bo'lmasa ovozli xabar kelganini ko'radi), ovozning o'zi esa faqat
   * shu sessiyada, brauzer xotirasida qoladi.
   */
  const sendVoice = async (clip) => {
    const label = `🎤 ${t('messages.voiceMessage')} · ${formatDuration(clip.durationMs)}`
    const tempId = pushOptimistic(label)
    attachVoice(tempId, clip)

    try {
      const created = await sendMessage(conversationId, label)
      finishSend(tempId, created)
      log.chat('Ovozli xabar yuborildi', { ms: clip.durationMs })
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setAlert(errorMessage(err, t))
      log.chat.error('Ovozli xabar yuborilmadi', err)
    }
  }

  /* ------------------------------ Qo'shimchalar ---------------------------- */

  const addFiles = async (files) => {
    const room = MAX_ITEMS - pending.length
    if (room <= 0) {
      setAlert(t('messages.attachMax', { count: MAX_ITEMS }))
      return
    }

    const accepted = []
    let problem = ''
    for (const file of files.slice(0, room)) {
      const bad = validate(file)
      if (bad) {
        problem = t(bad)
        continue
      }
      accepted.push(makeAttachment(file))
    }
    if (files.length > room && !problem) problem = t('messages.attachMax', { count: MAX_ITEMS })
    setAlert(problem)

    // Video davomiyligi metama'lumotdan o'qiladi (pufakchada ko'rsatiladi).
    await Promise.all(
      accepted
        .filter((a) => a.kind === 'video')
        .map(async (a) => {
          a.duration = await readVideoDuration(a.url)
        }),
    )
    if (accepted.length) setPending((prev) => [...prev, ...accepted])
  }

  const dropAttachment = (att) => {
    releaseAttachment(att)
    setPending((prev) => prev.filter((a) => a.id !== att.id))
  }

  /** Media xabari: matn ixtiyoriy izoh bo'lib boradi. */
  const sendMedia = async (caption) => {
    const items = pending
    setPending([])
    setDraft('')

    const label = caption || mediaLabel(items, t)
    const tempId = pushOptimistic(label)
    attachMedia(tempId, items)
    setProgress(tempId, 0)

    // TODO: Implement file upload to backend — hozircha jarayon taqlid
    // qilinadi, fayllar esa faqat shu sessiyada saqlanadi.
    await simulateUpload((pct) => setProgress(tempId, pct))

    try {
      const created = await sendMessage(conversationId, label)
      moveMedia(tempId, created.id)
      finishSend(tempId, created)
      setProgress(created.id, null)
      log.chat('Media yuborildi', { count: items.length })
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setProgress(tempId, null)
      setAlert(errorMessage(err, t))
      log.chat.error('Media yuborilmadi', err)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const startReply = (message) =>
    setReplyTo({
      id: message.id,
      mine: message.sender_id === user?.id,
      preview: message.content.slice(0, 90),
    })

  /* -------------------------------- Ko'rinish ------------------------------ */

  return (
    <div className="chat-panel">
      <header className="chat-header">
        {onBack && (
          <button type="button" className="icon-btn" onClick={onBack} aria-label={t('common.back')}>
            <ArrowLeftIcon size={17} />
          </button>
        )}

        {/* Suhbatdosh — bosilganda uning profiliga o'tadi. */}
        <button
          type="button"
          className="chat-peer"
          onClick={() => other?.id && navigate(`/profile/${other.id}`)}
          disabled={!other?.id}
        >
          <span className={`chat-peer-face${presence.online ? ' is-online' : ''}`}>
            <Avatar name={other?.name} src={other?.avatar_url} size={34} />
          </span>
          <span className="chat-peer-text">
            <span className="name">
              <span className="chat-peer-name-text">{other?.name || t('messages.title')}</span>
              {/* Premium foydalanuvchining nishoni — profildagi bilan bir xil. */}
              {other?.is_premium && <PremiumBadge compact />}
            </span>
            {presenceText && (
              <span className={`chat-peer-status${presence.online ? ' is-online' : ''}`}>
                {presenceText}
              </span>
            )}
          </span>
        </button>

        {/* Ovozli qo'ng'iroq — olovli urg'u (spetsifikatsiya bo'yicha). */}
        <button
          type="button"
          className="icon-btn is-fire"
          onClick={() => call.start('voice')}
          aria-label={t('call.voice')}
        >
          <PhoneCallIcon size={18} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => call.start('video')}
          aria-label={t('call.video')}
        >
          <VideoIcon size={18} />
        </button>
      </header>

      <div className="chat-body">
        {alert && <div className="alert">{alert}</div>}

        {messages.length === 0 && !alert && <p className="chat-hint">{t('messages.startHint')}</p>}

        {messages.map((msg, i) => {
          const mine = msg.sender_id === user?.id
          const prev = messages[i - 1]
          const showDay = !prev || !sameDay(prev.created_at, msg.created_at)
          const status = msg.pending ? 'sending' : msg.is_read ? 'read' : 'delivered'

          return (
            <div key={msg.id}>
              {showDay && (
                <div className="chat-day-row">
                  <span className="chat-day">{formatDayDivider(msg.created_at, lang, t)}</span>
                </div>
              )}

              <MessageBubble
                message={msg}
                mine={mine}
                status={status}
                voice={getVoice(msg.id)}
                media={getMedia(msg.id)}
                progress={extras.progress.get(msg.id) ?? null}
                reply={extras.replies.get(msg.id) ?? null}
                reaction={extras.reactions.get(msg.id) ?? null}
                onReply={startReply}
                onReact={toggleReaction}
              />
            </div>
          )
        })}

        {peerTyping && <TypingDots name={other?.name} />}

        <div ref={bottomRef} />
      </div>

      {/* Javob berilayotgan xabar. */}
      {replyTo && (
        <div className="reply-strip">
          <span className="reply-strip-body">
            <span className="reply-strip-who">
              {replyTo.mine ? t('messages.you') : other?.name || t('messages.peer')}
            </span>
            <span className="reply-strip-text">{replyTo.preview}</span>
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setReplyTo(null)}
            aria-label={t('common.cancel')}
          >
            <XIcon size={15} />
          </button>
        </div>
      )}

      {/* Yuborishdan oldingi ko'rinish. */}
      {pending.length > 0 && (
        <div className="pending-row">
          {pending.map((att) => (
            <div key={att.id} className={`pending-item is-${att.kind}`}>
              {att.kind === 'image' && <img src={att.url} alt="" />}
              {att.kind === 'video' && <video src={att.url} preload="metadata" muted />}
              {att.kind === 'file' && <span className="pending-name">{att.name}</span>}
              <button
                type="button"
                className="pending-remove"
                onClick={() => dropAttachment(att)}
                aria-label={t('common.delete')}
              >
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="chat-input-bar" onSubmit={submit}>
        <AttachMenu onFiles={addFiles} disabled={sending} />

        <textarea
          className="chat-input"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('messages.inputPlaceholder')}
          aria-label={t('messages.inputPlaceholder')}
        />

        {draft.trim() || pending.length ? (
          <button
            type="submit"
            className="chat-send"
            disabled={sending}
            aria-label={t('messages.send')}
          >
            <SendIcon size={17} />
          </button>
        ) : (
          <VoiceRecorder
            onRecorded={sendVoice}
            onError={() => setAlert(t('messages.micDenied'))}
            disabled={sending}
          />
        )}
      </form>

      <CallOverlay call={call} peer={other} onClose={call.hangUp} />
    </div>
  )
}
