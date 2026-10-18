import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { spring, tapSmall } from '../motion.js'

/**
 * Tasdiqlash oynasi — brauzerning window.confirm oynasi o'rniga.
 * Ochiq bo'lganda Esc yopadi, fon bosilsa ham yopiladi.
 *
 * <body> ga portal qilinadi: fon `position: fixed`, sahifa qobig'i esa
 * o'tish paytida `transform` qo'llaydi — transformlangan ota element fixed
 * uchun tayanch yaratib, oynani noto'g'ri joyga qo'yardi.
 */
export default function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}) {
  const t = useT()

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2 className="modal-title">{title}</h2>
              <motion.button
                type="button"
                className="icon-btn"
                whileTap={tapSmall}
                onClick={onCancel}
                aria-label={t('common.close')}
              >
                <XIcon size={16} />
              </motion.button>
            </div>

            {text && <p className="modal-text">{text}</p>}

            <div className="modal-foot">
              <motion.button
                type="button"
                className="btn btn-ghost btn-sm"
                whileTap={tapSmall}
                onClick={onCancel}
              >
                {t('common.cancel')}
              </motion.button>
              <motion.button
                type="button"
                className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
                whileTap={tapSmall}
                onClick={onConfirm}
                autoFocus
              >
                {confirmLabel || t('common.yes')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
