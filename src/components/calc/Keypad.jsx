/**
 * Kalkulyator klaviaturasi — oddiy hisob va hosil bashorati uchun bitta to'r.
 *
 * NIMA UCHUN BU YERDA framer-motion YO'Q. Ilgari har bir tugma
 * `motion.button` edi va bosilganda `whileTap` animatsiyasi ishga tushardi:
 * o'n to'qqizta tugma uchun har bir bosishda JavaScript animatsiya sikli
 * boshlanib, kiritish sezilarli kechikish bilan tushardi. Endi tugmalar —
 * oddiy `<button>`, bosilish holati esa CSS `:active` bilan beriladi.
 * Natija darhol ko'rinadi.
 *
 * `rows` — kalitlar jadvali: [{ k, label, kind, wide }]
 *   kind: 'op' (amal) | 'clear' (tozalash) | 'eq' (teng) | undefined (raqam)
 */
export default function Keypad({ rows, onKey, className = '' }) {
  return (
    <div className={`calc-keys ${className}`.trim()}>
      {rows.flat().map((key) => (
        <button
          key={key.k}
          type="button"
          className={`calc-key${key.kind ? ` is-${key.kind}` : ''}${key.wide ? ' is-wide' : ''}`}
          onClick={() => onKey(key.k)}
          aria-label={key.aria || undefined}
        >
          {key.label ?? key.k}
        </button>
      ))}
    </div>
  )
}
