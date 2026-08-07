import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons.jsx'

export default function Header({ title, subtitle, backTo }) {
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-row">
        {backTo && (
          <button
            type="button"
            className="header-back"
            aria-label="Orqaga"
            onClick={() => navigate(backTo)}
          >
            <ArrowLeftIcon size={19} />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
