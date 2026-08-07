import { motion } from 'framer-motion'
import { InboxIcon } from './Icons.jsx'
import { spring } from '../motion.js'

export default function EmptyState({ icon: Icon = InboxIcon, title, text, action }) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="empty-icon"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.06 }}
      >
        <Icon size={32} />
      </motion.div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </motion.div>
  )
}
