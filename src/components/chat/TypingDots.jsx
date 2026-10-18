import { useT } from '../../i18n/index.jsx'

/** "Yozmoqda..." — uchta sakrab turuvchi nuqta (CSS animatsiyasi). */
export default function TypingDots({ name }) {
  const t = useT()
  return (
    <div className="typing" role="status" aria-live="polite">
      <span className="typing-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="typing-text">{t('messages.typing', { name: name || '' })}</span>
    </div>
  )
}
