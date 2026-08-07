import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import { ConversationSkeleton } from '../components/Skeletons.jsx'
import { MessageIcon } from '../components/Icons.jsx'
import { errorMessage, getConversations } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import { listContainer, listItem } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import { formatChatTime } from '../utils.js'

const POLL_MS = 8000

/** Suhbatlar ro'yxati (Instagram DM uslubida). */
export default function ConversationsPage() {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user, loading: userLoading } = useCurrentUser()

  const [items, setItems] = useState(null)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      setItems(await getConversations())
      setAlert('')
    } catch (err) {
      if (err?.response?.status !== 401) setAlert(errorMessage(err, t))
      setItems([])
    }
  }, [t])

  useEffect(() => {
    if (!user) return undefined
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [user, load])

  if (!userLoading && !user) {
    return (
      <PageShell>
        <Header title={t('messages.title')} subtitle={t('messages.subtitle')} />
        <main className="page">
          <AuthRequired text={t('auth.needMessages')} />
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <Header title={t('messages.title')} subtitle={t('messages.subtitle')} />

      <PullToRefresh onRefresh={load}>
        <main className="page page-flush">
          {alert && (
            <div className="alert" style={{ margin: '0 16px 16px' }}>
              {alert}
            </div>
          )}

          {(userLoading || items === null) && <ConversationSkeleton />}

          {items !== null && items.length === 0 && !alert && (
            <EmptyState
              icon={MessageIcon}
              title={t('messages.empty')}
              text={t('messages.emptyHint')}
            />
          )}

          {items !== null && items.length > 0 && (
            <motion.div variants={listContainer} initial="initial" animate="animate">
              {items.map((conv) => {
                const unread = conv.unread_count > 0
                const mine = conv.last_message_sender_id === user?.id

                return (
                  <motion.button
                    key={conv.id}
                    type="button"
                    className="conv-row"
                    variants={listItem}
                    whileTap={{ opacity: 0.65 }}
                    onClick={() => navigate(`/xabarlar/${conv.id}`)}
                  >
                    <Avatar
                      name={conv.other_user.name}
                      src={conv.other_user.avatar_url}
                      size={50}
                    />

                    <div className="conv-body">
                      <div className="conv-name">{conv.other_user.name}</div>
                      <div className={`conv-preview${unread ? ' unread' : ''}`}>
                        {conv.last_message
                          ? `${mine ? `${t('messages.you')}: ` : ''}${conv.last_message}`
                          : t('messages.startHint')}
                      </div>
                    </div>

                    <div className="conv-side">
                      <span className="conv-time">
                        {formatChatTime(conv.last_message_at, lang, t)}
                      </span>
                      {unread && (
                        <motion.span
                          className="conv-dot"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </main>
      </PullToRefresh>
    </PageShell>
  )
}
