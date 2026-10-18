import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '../Icons.jsx'
import { BlockSkeleton } from '../Skeletons.jsx'
import EmptyState from '../EmptyState.jsx'
import { ChartIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'

/**
 * Yig'iladigan statistika kartasi.
 *
 * Yopilganda ichidagi diagramma umuman render qilinmaydi — sakkizta bo'limning
 * hammasi bir vaqtda chizilsa, sahifa mount bo'lishi juda qimmatga tushardi.
 * Ochilish/yopilish `height` bilan animatsiya qilinmaydi (u har kadrda butun
 * sahifani qayta joylashtiradi) — kontent so'nib paydo bo'ladi, xolos.
 *
 * Ochilganda karta darhol kengayadi, og'ir diagramma esa keyingi bo'sh kadrda,
 * past ustuvorlikda mount bo'ladi. Shu tufayli bir necha bo'lim ketma-ket
 * ochilsa ham, ularning hammasi bitta katta renderga yig'ilib qolmaydi.
 *
 * Karta HAR DOIM faqat birinchi o'ntasini ko'rsatadi. Pastdagi "Batafsil"
 * tugmasi ro'yxatni joyida yoymaydi, balki alohida to'liq ekranli sahifaga
 * o'tadi (`detailTo`) — u yerda to'liq ro'yxat (200 tagacha) va shu
 * sahifaning o'z filtrlari bo'ladi.
 */
export default function StatSection({
  index,
  title,
  hint,
  icon: Icon,
  open,
  onToggle,
  loading = false,
  empty = false,
  meta,
  detailTo,
  total = 0,
  children,
}) {
  const t = useT()
  // Diagramma mount bo'lishga tayyormi (ochilgandan keyingi bo'sh kadrda).
  const [ready, setReady] = useState(open)

  useEffect(() => {
    if (!open) {
      setReady(false)
      return undefined
    }
    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 16))
    const cancel = window.cancelIdleCallback || window.clearTimeout
    const handle = idle(() => startTransition(() => setReady(true)))
    return () => cancel(handle)
  }, [open])

  return (
    <section className={`sblock${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="sblock-head"
        aria-expanded={open}
        onClick={onToggle}
      >
        {/* Rang CSS da (--fire) — bo'lim ikonkalari yagona urg'u rangida. */}
        <span className="sblock-num" aria-hidden="true">
          {Icon ? <Icon size={15} /> : index}
        </span>

        <span className="sblock-titles">
          <span className="sblock-title">{title}</span>
          {hint && <span className="sblock-hint">{hint}</span>}
        </span>

        {meta && <span className="sblock-meta">{meta}</span>}

        <span className="sblock-chevron" aria-hidden="true">
          <ChevronRightIcon size={16} />
        </span>
      </button>

      {open && (
        <div className="sblock-body">
          {loading || !ready ? (
            <BlockSkeleton height={220} />
          ) : empty ? (
            <EmptyState
              icon={ChartIcon}
              title={t('stats.emptyFilter')}
              text={t('stats.emptyFilterHint')}
            />
          ) : (
            <>
              {children}

              {detailTo && (
                <div className="sblock-foot">
                  <Link
                    to={detailTo}
                    className="btn-expand"
                    aria-label={t('stats.showMoreAria', { n: total })}
                  >
                    {t('stats.showMore')}
                    <ChevronRightIcon size={15} className="btn-expand-chevron" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}
