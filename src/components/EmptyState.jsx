import { motion } from 'framer-motion'
import { InboxIcon } from './Icons.jsx'

export default function EmptyState({ icon: Icon = InboxIcon, title, text, action }) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="empty-icon" aria-hidden="true">
        <Icon size={19} />
      </span>
      <h3 className="empty-title">{title}</h3>
      {text && <p className="empty-text">{text}</p>}
      {action && <div className="empty-action">{action}</div>}
    </motion.div>
  )
}
