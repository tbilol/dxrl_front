import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { InboxIcon, PlusIcon } from '../components/Icons.jsx'
import { errorMessage, getRequests } from '../api.js'

export default function RequestListPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRequests()
      .then((data) => active && setRequests(data))
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <Header
        title="So'rovlar"
        subtitle={
          loading ? 'Yuklanmoqda...' : `${requests.length} ta sotib oluvchi so'rovi`
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

        {!loading && !error && requests.length === 0 && (
          <div className="empty">
            <div className="empty-icon">
              <InboxIcon size={30} />
            </div>
            <h3>Hozircha so'rovlar yo'q</h3>
            <p>Mahsulot sotib olish uchun "+" tugmasi orqali so'rov qoldiring.</p>
          </div>
        )}

        {!loading &&
          requests.map((item) => <ListingCard key={item.id} item={item} type="request" />)}
      </main>

      <Link to="/sorovlar/yangi" className="fab" aria-label="Yangi so'rov qo'shish">
        <PlusIcon size={26} />
      </Link>
    </>
  )
}
