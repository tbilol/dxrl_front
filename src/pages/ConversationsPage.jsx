import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatPage from './ChatPage.jsx'
import ConversationList from '../components/ConversationList.jsx'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import { ConversationSkeleton } from '../components/Skeletons.jsx'
import { MessageIcon } from '../components/Icons.jsx'
import { errorMessage, getConversations } from '../services/index.js'
import { useLanguage } from '../i18n/index.jsx'
import useCurrentUser from '../currentUser.jsx'
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
  const activeRef = useRef(true)

  const load = useCallback(async () => {
    try {
      const data = await getConversations()
      if (!activeRef.current) return
      /*
       * startTransition — ro'yxatni chizish shoshilinch emas.
       * Ma'lumot kelganda o'nlab qatorni bir zarbada chizish asosiy oqimni
       * ~70ms band qilardi; aynan shu paytda pastki menyu animatsiyasi
       * to'xtab, menyu "qotib qolgandek" ko'rinardi. Endi React bu ishni
       * bo'laklab bajaradi va bosishga javob berish uchun to'xtay oladi.
       */
      startTransition(() => {
        setItems(data)
        setAlert('')
      })
      log.chat('Suhbatlar yangilandi', { count: data.length })
    } catch (err) {
      if (!activeRef.current) return
      if (err?.response?.status !== 401) setAlert(errorMessage(err, t))
      log.chat.error('Suhbatlarni yuklab bo\'lmadi', err)
      setItems([])
    }
  }, [t])

  useEffect(() => {
    activeRef.current = true
    if (!user) return () => {
      activeRef.current = false
    }
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, POLL_MS)
    return () => {
      activeRef.current = false
      clearInterval(timer)
    }
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

  /* ------------------- Desktop: ikki panelli maket ------------------------- */

  /*
   * Desktopda "Xabarlar" va ochiq suhbat bitta maketda yashaydi (Telegram
   * kabi), shuning uchun bu yerda <ChatPage> qayta ishlatiladi — u
   * suhbat tanlanmaganida o'ng panelda bo'sh holatni ko'rsatadi.
   */
  if (isDesktop) return <ChatPage />

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
            <div className="alert" style={{ margin: '0 var(--s-4) var(--s-4)' }}>
              {alert}
            </div>
          )}
          {list}
        </main>
      </PullToRefresh>
    </PageShell>
  )
}
