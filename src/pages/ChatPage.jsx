import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatPanel from '../components/ChatPanel.jsx'
import ConversationList from '../components/ConversationList.jsx'
import PageShell from '../components/PageShell.jsx'
import { getConversations } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import useCurrentUser from '../useCurrentUser.js'
import { useIsDesktop } from '../useMediaQuery.js'

/**
 * Yozishmalar sahifasi.
 *   mobil / planshet — faqat yozishma (planshetda markazda, tor ustunda)
 *   desktop          — chapda suhbatlar ro'yxati, o'ngda yozishma (Telegram uslubi)
 */
export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useCurrentUser()
  const isDesktop = useIsDesktop()

  const [conversations, setConversations] = useState([])

  // Suhbatdosh ma'lumoti va desktopdagi yon ro'yxat uchun.
  useEffect(() => {
    let active = true
    getConversations()
      .then((list) => active && setConversations(list))
      .catch(() => {
        /* sarlavha ikkinchi darajali — xabarlar baribir yuklanadi */
      })
    return () => {
      active = false
    }
  }, [conversationId])

  const other = conversations.find((c) => c.id === conversationId)?.other_user ?? null

  return (
    <PageShell variant="slide" width="full" className="messages-shell">
      {isDesktop && (
        <aside className="messages-aside" aria-label={t('messages.title')}>
          <div className="messages-aside-head">{t('messages.title')}</div>
          <div className="messages-aside-list">
            <ConversationList
              items={conversations}
              currentUserId={user?.id}
              activeId={conversationId}
              onSelect={(conv) => navigate(`/xabarlar/${conv.id}`)}
            />
          </div>
        </aside>
      )}

      <div className="messages-main">
        <ChatPanel
          conversationId={conversationId}
          other={other}
          onBack={isDesktop ? undefined : () => navigate('/xabarlar')}
        />
      </div>
    </PageShell>
  )
}
