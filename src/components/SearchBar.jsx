import { SearchIcon, XIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'

/**
 * Bo'limlar ustidagi yagona ko'rinishdagi qidiruv maydoni.
 * Faqat boshqariladigan qiymat — filtrlash chaqiruvchi sahifada bajariladi.
 */
export default function SearchBar({ value, onChange, placeholder }) {
  const t = useT()
  const label = placeholder || t('common.search')

  return (
    <div className="searchbar">
      <span className="searchbar-icon" aria-hidden="true">
        <SearchIcon size={16} />
      </span>

      <input
        type="text"
        className="searchbar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        aria-label={label}
        autoComplete="off"
      />

      {value && (
        <button
          type="button"
          className="searchbar-clear"
          onClick={() => onChange('')}
          aria-label={t('common.clear')}
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}
