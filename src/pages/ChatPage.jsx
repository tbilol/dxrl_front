import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatPanel from '../components/ChatPanel.jsx'
import ConversationList from '../components/ConversationList.jsx'
import PageShell from '../components/PageShell.jsx'
import SearchBar from '../components/SearchBar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { MessageIcon } from '../components/Icons.jsx'
import { getConversations } from '../services/index.js'
import useSplit, { MIN_LIST } from '../chat/split.js'
import { useLanguage } from '../i18n/index.jsx'
import useCurrentUser from '../currentUser.jsx'
import { useIsDesktop } from '../useMediaQuery.js'
import { normalizeSearch } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/** Suhbat yopilish animatsiyasi davomiyligi (CSS bilan bir xil). */
const CLOSE_MS = 250

/**
 * Yozishmalar sahifasi.
 *
 *   mobil    — suhbat butun ekranni egallaydi, o'ngdan suriladi va pastki
 *              menyu pastga siljib yashirinadi (Layout dagi `chat-open`).
 *   desktop  — Telegram uslubidagi ikki panel: chapda ro'yxat, o'ngda
 *              yozishma, orasida sudraladigan ajratgich.
 */
export default function ChatPage() {
  useLogMount('ChatPage')
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user } = useCurrentUser()
  const isDesktop = useIsDesktop()

  const splitRef = useRef(null)
  const { width, dragging, startDrag, cycleMode, avatarsOnly } = useSplit(splitRef)

  const [conversations, setConversations] = useState([])
  const [query, setQuery] = useState('')
  const [closing, setClosing] = useState(false)

  // Suhbatdosh ma'lumoti va desktopdagi yon ro'yxat uchun.
  useEffect(() => {
    let active = true
    getConversations()
      .then((list) => {
        if (!active) return
        setConversations(list)
        log.chat('Suhbatlar ro\'yxati yuklandi', { count: list.length, active: conversationId })
      })
      .catch(() => {
        /* sarlavha ikkinchi darajali — xabarlar baribir yuklanadi */
      })
    return () => {
      active = false
    }
  }, [conversationId])

  const other = conversations.find((c) => c.id === conversationId)?.other_user ?? null

  const shown = useMemo(() => {
    const q = normalizeSearch(query)
    if (!q) return conversations
    return conversations.filter((c) => normalizeSearch(c.other_user?.name).includes(q))
  }, [conversations, query])

  /**
   * Mobilda orqaga: avval chiqish animatsiyasi, keyin marshrut o'zgaradi.
   * (Marshrutlar <AnimatePresence> ichida emas — u har bir o'tishni
   * sekinlashtirardi, shuning uchun chiqish shu yerda boshqariladi.)
   */
  const close = useCallback(() => {
    setClosing(true)
    setTimeout(() => navigate('/xabarlar'), CLOSE_MS)
  }, [navigate])

  /* ----------------------------- Desktop ----------------------------- */

  if (isDesktop) {
    return (
      <PageShell width="full" className="messages-shell">
        <div
          className={`split${dragging ? ' is-dragging' : ''}`}
          ref={splitRef}
          style={{ '--list-w': `${width || MIN_LIST}px` }}
        >
          <aside
            className={`messages-aside${avatarsOnly ? ' is-compact' : ''}`}
            aria-label={t('messages.title')}
          >
            {!avatarsOnly && (
              <div className="messages-aside-head">
                <SearchBar value={query} onChange={setQuery} placeholder={t('messages.search')} />
              </div>
            )}
            <div className="messages-aside-list">
              <ConversationList
                items={shown}
                currentUserId={user?.id}
                activeId={conversationId}
                compact={avatarsOnly}
                onSelect={(conv) => navigate(`/xabarlar/${conv.id}`)}
              />
            </div>
          </aside>

          {/* Sudraladigan ajratgich. Ikki marta bosilsa tayanch holatlar
              orasida aylanadi (tor / o'rtacha / keng). */}
          <div
            className="split-bar"
            role="separator"
            aria-orientation="vertical"
            aria-label={t('messages.resize')}
            onPointerDown={startDrag}
            onDoubleClick={cycleMode}
            title={t('messages.resizeHint')}
          >
            <span className="split-grip" aria-hidden="true" />
          </div>

          <div className="messages-main">
            {conversationId ? (
              <ChatPanel conversationId={conversationId} other={other} />
            ) : (
              <div className="chat-placeholder">
                <EmptyState
                  icon={MessageIcon}
                  title={t('messages.pickChat')}
                  text={t('messages.pickChatHint')}
                />
              </div>
            )}
          </div>
        </div>
      </PageShell>
    )
  }

  /* ------------------------------ Mobil ------------------------------ */

  return (
    <div className={`chat-overlay${closing ? ' is-closing' : ''}`}>
      <ChatPanel conversationId={conversationId} other={other} onBack={close} />
    </div>
  )
}
