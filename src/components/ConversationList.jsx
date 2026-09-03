import { motion } from 'framer-motion'
import Avatar from './Avatar.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { listContainer, listItem } from '../motion.js'
import { formatChatTime } from '../utils.js'

/**
 * Suhbatlar qatorlari. Mobil sahifada ham, desktopdagi chap panelda ham
 * xuddi shu ro'yxat ishlatiladi (`activeId` — ochiq suhbat).
 */
export default function ConversationList({ items, currentUserId, activeId, onSelect }) {
  const { lang, t } = useLanguage()

  return (
    <motion.div variants={listContainer} initial="initial" animate="animate">
      {items.map((conv) => {
        const unread = conv.unread_count > 0
        const mine = conv.last_message_sender_id === currentUserId
        const active = activeId === conv.id

        return (
          <motion.button
            key={conv.id}
            type="button"
            className={`conv-row${active ? ' active' : ''}`}
            variants={listItem}
            whileTap={{ opacity: 0.65 }}
            aria-current={active ? 'true' : undefined}
            onClick={() => onSelect(conv)}
          >
            <Avatar name={conv.other_user.name} src={conv.other_user.avatar_url} size={50} />

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
  )
}
