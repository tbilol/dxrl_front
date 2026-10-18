import { ChevronRightIcon } from './Icons.jsx'

/**
 * Sozlamalar sahifasining qurilish bloklari.
 *
 * <SettingsSection> — sarlavhali guruh, ichida kartaga solingan qatorlar.
 * <SettingsRow>     — bitta sozlama: chapda ikonka, o'rtada nom va izoh,
 *                     o'ngda boshqaruv (almashtirgich, segment yoki strelka).
 *
 * Bosiladigan qator uchun `whileTap` ishlatilmaydi: butun kenglikdagi qatorni
 * kichraytirish qo'pol ko'rinadi va soyani titratadi. O'rniga CSS `:active`
 * fonni bir zumda o'zgartiradi — bu tezroq va aniqroq javob beradi.
 */

export function SettingsSection({ icon: Icon, title, hint, children }) {
  return (
    <section className="set-section">
      <h2 className="set-head">
        {Icon && (
          <span className="set-head-icon" aria-hidden="true">
            <Icon size={14} />
          </span>
        )}
        {title}
      </h2>

      <div className="set-card">{children}</div>

      {hint && <p className="set-hint">{hint}</p>}
    </section>
  )
}

export function SettingsRow({
  icon: Icon,
  label,
  description,
  control,
  onClick,
  chevron = false,
  danger = false,
  disabled = false,
  stacked = false,
  labelFor,
}) {
  const className = [
    'set-row',
    onClick ? 'is-tappable' : '',
    danger ? 'is-danger' : '',
    stacked ? 'is-stacked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const body = (
    <>
      {Icon && (
        <span className="set-icon" aria-hidden="true">
          <Icon size={17} />
        </span>
      )}

      <span className="set-body">
        {labelFor ? (
          <label className="set-label" htmlFor={labelFor}>
            {label}
          </label>
        ) : (
          <span className="set-label">{label}</span>
        )}
        {description && <span className="set-desc">{description}</span>}
      </span>

      {control && <span className="set-control">{control}</span>}

      {chevron && (
        <span className="set-chevron" aria-hidden="true">
          <ChevronRightIcon size={16} />
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} disabled={disabled}>
        {body}
      </button>
    )
  }

  return <div className={className}>{body}</div>
}
