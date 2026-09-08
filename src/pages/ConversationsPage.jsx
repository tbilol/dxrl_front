import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConversationList from '../components/ConversationList.jsx'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import { ConversationSkeleton } from '../components/Skeletons.jsx'
import { MessageIcon } from '../components/Icons.jsx'
import { errorMessage, getConversations } from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import useCurrentUser from '../useCurrentUser.js'
import { useIsDesktop } from '../useMediaQuery.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

const POLL_MS = 8000

/** Suhbatlar ro'yxati. Desktopda Telegram uslubidagi ikki panelli ko'rinish. */
export default function ConversationsPage() {
  useLogMount('ConversationsPage')
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { user, loading: userLoading } = useCurrentUser()
  const isDesktop = useIsDesktop()

  const [items, setItems] = useState(null)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getConversations()
      setItems(data)
      log.chat('Suhbatlar yangilandi', { count: data.length })
      setAlert('')
    } catch (err) {
      if (err?.response?.status !== 401) setAlert(errorMessage(err, t))
      log.chat.error('Suhbatlarni yuklab bo\'lmadi', err)
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

  /* ---------------------------- Kirmagan holat ---------------------------- */

  if (!userLoading && !user) {
    return (
      <PageShell width="mid">
        <Header
          title={t('messages.title')}
          subtitle={t('messages.subtitle')}
          backTo="/profil"
          backLabel={t('common.back')}
        />
        <main className="page">
          <AuthRequired text={t('auth.needMessages')} />
        </main>
      </PageShell>
    )
  }

  const loading = userLoading || items === null
  const empty = items !== null && items.length === 0 && !alert

  const list = (
    <>
      {loading && <ConversationSkeleton />}

      {empty && (
        <EmptyState icon={MessageIcon} title={t('messages.empty')} text={t('messages.emptyHint')} />
      )}

      {items !== null && items.length > 0 && (
        <ConversationList
          items={items}
          currentUserId={user?.id}
          onSelect={(conv) => {
            log.chat('Suhbat tanlandi', conv.id)
            navigate(`/xabarlar/${conv.id}`)
          }}
        />
      )}
    </>
  )

  /* ------------------- Desktop: ro'yxat + yozishma sohasi ------------------ */

  if (isDesktop) {
    return (
      <PageShell width="full" className="messages-shell">
        <aside className="messages-aside" aria-label={t('messages.title')}>
          <div className="messages-aside-head">{t('messages.title')}</div>
          <div className="messages-aside-list">
            {alert && (
              <div className="alert" style={{ margin: 'var(--sp-4)' }}>
                {alert}
              </div>
            )}
            {list}
          </div>
        </aside>

        <div className="messages-main">
          <div className="chat-placeholder">
            <EmptyState
              icon={MessageIcon}
              title={t('messages.title')}
              text={t('messages.emptyHint')}
            />
          </div>
        </div>
      </PageShell>
    )
  }

  /* ------------------------ Mobil / planshet ko'rinishi -------------------- */

  return (
    <PageShell width="mid" variant="slide">
      <Header
        title={t('messages.title')}
        subtitle={t('messages.subtitle')}
        backTo="/profil"
        backLabel={t('common.back')}
      />

      <PullToRefresh onRefresh={load}>
        <main className="page page-flush">
          {alert && (
            <div className="alert" style={{ margin: '0 16px 16px' }}>
              {alert}
            </div>
          )}
          {list}
        </main>
      </PullToRefresh>
    </PageShell>
  )
}
