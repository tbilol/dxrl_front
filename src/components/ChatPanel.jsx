import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import { ArrowLeftIcon, SendIcon } from './Icons.jsx'
import { errorMessage, getMessages, sendMessage } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import { bubbleIn, tapSmall } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import { formatDayDivider, formatTime, sameDay } from '../utils.js'
import log from '../logger.js'

const POLL_MS = 5000

/**
 * Yozishmalar paneli — sarlavha, xabarlar oqimi va kiritish qatori.
 * Chat sahifasida ham, e'lon tafsiloti sahifasining o'ng ustunida ham ishlatiladi.
 * Balandlik ota konteynerdan olinadi (`height: 100%`), shuning uchun kiritish
 * qatori har qanday ekranda pastda qoladi — fixed pozitsiya kerak emas.
 */
export default function ChatPanel({ conversationId, other, onBack }) {
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [alert, setAlert] = useState('')

  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)

  const load = useCallback(
    async ({ silent } = {}) => {
      try {
        if (silent) log.chat('Yangi xabarlar tekshirilmoqda...', conversationId)
        const data = await getMessages(conversationId)
        setMessages(data)
        if (!silent) {
          setAlert('')
          log.chat('Suhbat ochildi', { conversationId, messages: data.length })
        }
      } catch (err) {
        if (!silent) setAlert(errorMessage(err, t))
        log.chat.error('Xabarlarni yuklab bo\'lmadi', err)
      }
    },
    [conversationId, t],
  )

  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load({ silent: true })
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  // Yangi xabar kelganda pastga suramiz.
  useEffect(() => {
    const lastId = messages.length ? messages[messages.length - 1].id : null
    if (lastId && lastId !== lastIdRef.current) {
      lastIdRef.current = lastId
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const submit = async (e) => {
    e?.preventDefault()
    const content = draft.trim()
    if (!content || sending) return

    setSending(true)
    setDraft('')
    try {
      const created = await sendMessage(conversationId, content)
      setMessages((prev) => [...prev, created])
      log.chat('Xabar yuborildi', {
        to: other?.id,
        preview: content.slice(0, 40),
        length: content.length,
      })
    } catch (err) {
      setAlert(errorMessage(err, t))
      setDraft(content) // matn yo'qolmasin
      log.chat.error('Xabar yuborilmadi', err)
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="chat-panel">
      <header className="chat-header">
        {onBack && (
          <motion.button
            type="button"
            className="icon-btn"
            whileTap={tapSmall}
            onClick={onBack}
            aria-label={t('common.back')}
          >
            <ArrowLeftIcon size={20} />
          </motion.button>
        )}

        {/* Suhbatdosh — bosilganda uning profiliga o'tadi. */}
        <button
          type="button"
          className="chat-peer"
          onClick={() => other?.id && navigate(`/profile/${other.id}`)}
          disabled={!other?.id}
        >
          <Avatar name={other?.name} src={other?.avatar_url} size={38} />
          <span className="name">{other?.name || t('messages.title')}</span>
        </button>
        <span className="online-dot" aria-hidden="true" />
      </header>

      <div className="chat-body">
        {alert && <div className="alert">{alert}</div>}

        {messages.length === 0 && !alert && (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 40, fontSize: 14 }}>
            {t('messages.startHint')}
          </p>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const mine = msg.sender_id === user?.id
            const prev = messages[i - 1]
            const showDay = !prev || !sameDay(prev.created_at, msg.created_at)

            return (
              <div key={msg.id}>
                {showDay && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="chat-day">{formatDayDivider(msg.created_at, lang, t)}</span>
                  </div>
                )}

                <motion.div
                  className={`bubble-row${mine ? ' mine' : ''}`}
                  variants={bubbleIn}
                  initial="initial"
                  animate="animate"
                  layout
                >
                  <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
                    {msg.content}
                    <span className="msg-time">{formatTime(msg.created_at)}</span>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={submit}>
        <textarea
          className="chat-input"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('messages.inputPlaceholder')}
          aria-label={t('messages.inputPlaceholder')}
        />
        <motion.button
          type="submit"
          className="chat-send"
          whileTap={tapSmall}
          disabled={!draft.trim() || sending}
          aria-label={t('messages.send')}
        >
          <SendIcon size={19} />
        </motion.button>
      </form>
    </div>
  )
}
