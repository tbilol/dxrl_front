import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { listContainerFor, listItem } from '../motion.js'
import useIncrementalList from '../useIncrementalList.js'
import { isRecentlyActive } from '../chat/presence.js'
import { formatChatTime } from '../utils.js'

/**
 * Suhbatlar qatorlari. Mobil sahifada ham, desktopdagi chap panelda ham
 * xuddi shu ro'yxat ishlatiladi (`activeId` — ochiq suhbat).
 */
/** Oxirgi xabar matni: media bo'lsa qisqa yorliq. */
function previewOf(conv, t, mine) {
  const raw = conv.last_message
  if (!raw) return t('messages.startHint')
  const prefix = mine ? `${t('messages.you')}: ` : ''
  return prefix + raw
}

export default function ConversationList({
  items,
  currentUserId,
  activeId,
  compact = false,
  onSelect,
}) {
  const { lang, t } = useLanguage()
  // Birinchi bo'lak darhol, qolgani brauzer bo'sh turganda — uzun ro'yxat
  // birinchi kadrni ushlab qolmaydi.
  const rendered = useIncrementalList(items)

  return (
    <motion.div variants={listContainerFor(items.length)} initial="initial" animate="animate">
      {rendered.map((conv) => {
        const unread = conv.unread_count > 0
        const mine = conv.last_message_sender_id === currentUserId
        const active = activeId === conv.id

        return (
          <motion.button
            key={conv.id}
            type="button"
            className={`conv-row${active ? ' active' : ''}${compact ? ' is-compact' : ''}`}
            variants={listItem}
            whileTap={{ opacity: 0.65 }}
            aria-current={active ? 'true' : undefined}
            onClick={() => onSelect(conv)}
          >
            {/* Onlayn holati suhbatdoshning oxirgi xabari vaqtidan chiqariladi
                (serverda `last_seen_at` maydoni yo'q — presence.js ga qarang). */}
            <span
              className={`conv-face${
                isRecentlyActive(conv.last_message_at, conv.last_message_sender_id, conv.other_user.id)
                  ? ' is-online'
                  : ''
              }`}
            >
              <Avatar name={conv.other_user.name} src={conv.other_user.avatar_url} size={40} />
            </span>

            {/* Tor rejimda faqat avatar qoladi — qolgani yashiriladi. */}
            {!compact && (
              <>
                <div className="conv-body">
                  <div className={`conv-name${unread ? ' unread' : ''}`}>
                    <span className="conv-name-text">{conv.other_user.name}</span>
                  </div>
                  <div className={`conv-preview${unread ? ' unread' : ''}`}>
                    {previewOf(conv, t, mine)}
                  </div>
                </div>

                <div className="conv-side">
                  <span className={`conv-time num${unread ? ' conv-time-unread' : ''}`}>
                    {formatChatTime(conv.last_message_at, lang, t)}
                  </span>
                  {unread && (
                    <motion.span className="conv-dot" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {conv.unread_count > 99 ? '99+' : conv.unread_count}
                    </motion.span>
                  )}
                </div>
              </>
            )}

            {/* Tor rejimda o'qilmaganlar soni avatar ustida ko'rinadi. */}
            {compact && unread && (
              <span className="conv-dot is-corner">
                {conv.unread_count > 9 ? '9+' : conv.unread_count}
              </span>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
