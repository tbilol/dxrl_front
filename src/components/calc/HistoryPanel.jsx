import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDownIcon, ClockIcon, TrashIcon } from '../Icons.jsx'
import { useLanguage } from '../../i18n/index.jsx'
import { enter } from '../../motion.js'
import { formatChatTime } from '../../utils.js'

/**
 * Hisob tarixi paneli — yopiq holatda faqat bitta qator egallaydi.
 *
 * Ikkala kalkulyator ham shu komponentdan foydalanadi; yozuv matnini
 * `renderRow(entry)` beradi ({ title, sub }), chunki oddiy hisob va hosil
 * bashorati turli ma'lumot saqlaydi.
 */
export default function HistoryPanel({ items, onPick, onClear, renderRow }) {
  const { lang, t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <div className="calc-history">
      <button
        type="button"
        className="ch-head"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="ch-title">
          <ClockIcon size={15} />
          {t('calc.history')}
          {items.length > 0 && <span className="ch-count num">{items.length}</span>}
        </span>
        <span className={`ch-chevron${open ? ' is-open' : ''}`} aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="ch-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={enter}
          >
            {items.length === 0 ? (
              <p className="ch-empty">{t('calc.historyEmpty')}</p>
            ) : (
              <>
                <ul className="ch-list">
                  {items.map((entry) => {
                    const row = renderRow(entry)
                    return (
                      <li key={entry.id}>
                        <button type="button" className="ch-item" onClick={() => onPick(entry)}>
                          <span className="ch-item-body">
                            <span className="ch-item-title num">{row.title}</span>
                            <span className="ch-item-sub">{row.sub}</span>
                          </span>
                          <span className="ch-item-time num">
                            {formatChatTime(entry.at, lang, t)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <button type="button" className="btn btn-ghost btn-sm ch-clear" onClick={onClear}>
                  <TrashIcon size={14} />
                  {t('calc.clearHistory')}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
