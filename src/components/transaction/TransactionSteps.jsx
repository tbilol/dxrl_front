import { motion } from 'framer-motion'
import {
  CheckIcon,
  HandshakeIcon,
  PackageIcon,
  ReceiptIcon,
  TruckIcon,
  WalletIcon,
} from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { listContainer, listItem } from '../../motion.js'
import { STEP_KEYS } from '../../services/index.js'

/** Har bir bosqichning ikonkasi. */
const ICONS = {
  pay: WalletIcon,
  escrow: WalletIcon,
  collect: TruckIcon,
  receipt: ReceiptIcon,
  handover: HandshakeIcon,
  received: PackageIcon,
  payout: CheckIcon,
}

/**
 * Eskrov bosqichlari ro'yxati — bajarilgan, joriy va kutilayotgan.
 *
 * Faqat ko'rsatish bilan shug'ullanadi: amallarni sahifa (TransactionPage)
 * boshqaradi.
 */
export default function TransactionSteps({ step, status }) {
  const t = useT()
  const done = status === 'done'

  return (
    <motion.ol className="tx-steps" variants={listContainer} initial="initial" animate="animate">
      {STEP_KEYS.map((key, i) => {
        const Icon = ICONS[key]
        const isDone = done || i < step
        const isCurrent = !done && i === step

        return (
          <motion.li
            key={key}
            className={`tx-step${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}
            variants={listItem}
          >
            <span className="tx-step-mark" aria-hidden="true">
              {isDone ? <CheckIcon size={14} /> : <Icon size={14} />}
            </span>
            <span className="tx-step-body">
              <span className="tx-step-title">{t(`tx.step.${key}`)}</span>
              <span className="tx-step-text">{t(`tx.stepHint.${key}`)}</span>
            </span>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
