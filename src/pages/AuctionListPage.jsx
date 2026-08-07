import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { GavelIcon, PlusIcon } from '../components/Icons.jsx'
import { errorMessage, getAuctions } from '../api.js'

export default function AuctionListPage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAuctions()
      .then((data) => active && setAuctions(data))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Header
        title="Agro Auksion"
        subtitle={
          loading ? 'Yuklanmoqda...' : `${auctions.length} ta faol auksion e'loni`
        }
      />

      <main className="page">
        {error && <div className="alert">{error}</div>}

        {loading && (
          <>
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </>
        )}

        {!loading && !error && auctions.length === 0 && (
          <div className="empty">
            <div className="empty-icon">
              <GavelIcon size={30} />
            </div>
            <h3>Hozircha auksionlar yo'q</h3>
            <p>Birinchi e'lonni joylashtirish uchun "+" tugmasini bosing.</p>
          </div>
        )}

        {!loading &&
          auctions.map((item) => <ListingCard key={item.id} item={item} type="auction" />)}
      </main>

      <Link to="/auksion/yangi" className="fab" aria-label="Yangi auksion qo'shish">
        <PlusIcon size={26} />
      </Link>
    </>
  )
}
