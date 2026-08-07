import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import PageShell from '../components/PageShell.jsx'
import { ArrowLeftIcon, SendIcon } from '../components/Icons.jsx'
import { errorMessage, getConversations, getMessages, sendMessage } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import { bubbleIn, tapSmall } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import { formatDayDivider, formatTime, sameDay } from '../utils.js'

const POLL_MS = 5000

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user } = useCurrentUser()

  const [messages, setMessages] = useState([])
  const [other, setOther] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [alert, setAlert] = useState('')

  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)

  // Suhbatdosh ma'lumotini ro'yxatdan olamiz.
  useEffect(() => {
    let active = true
    getConversations()
      .then((list) => {
        if (!active) return
        const conv = list.find((c) => c.id === conversationId)
        if (conv) setOther(conv.other_user)
      })
      .catch(() => {
        /* sarlavha ikkinchi darajali — xabarlar baribir yuklanadi */
      })
    return () => {
      active = false
    }
  }, [conversationId])

  const load = useCallback(
    async ({ silent } = {}) => {
      try {
        const data = await getMessages(conversationId)
        setMessages(data)
        if (!silent) setAlert('')
      } catch (err) {
        if (!silent) setAlert(errorMessage(err, t))
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
    } catch (err) {
      setAlert(errorMessage(err, t))
      setDraft(content) // matn yo'qolmasin
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
    <PageShell variant="slide" className="chat-page">
      <header className="chat-header">
        <motion.button
          type="button"
          className="icon-btn"
          whileTap={tapSmall}
          onClick={() => navigate('/xabarlar')}
          aria-label={t('common.back')}
        >
          <ArrowLeftIcon size={20} />
        </motion.button>

        <Avatar name={other?.name} src={other?.avatar_url} size={38} />
        <span className="name">{other?.name || t('messages.title')}</span>
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
                    <span className="chat-day">
                      {formatDayDivider(msg.created_at, lang, t)}
                    </span>
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
    </PageShell>
  )
}
