import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ListingCard from '../components/ListingCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import { ListingSkeleton } from '../components/Skeletons.jsx'
import { CartIcon, GavelIcon, PlusIcon } from '../components/Icons.jsx'
import { errorMessage, getAuctions, getRequests } from '../api.js'
import { useT } from '../i18n/index.jsx'
import { listContainer, tapSmall } from '../motion.js'

/** Auksionlar va so'rovlar ro'yxati — bitta komponent, `kind` bilan farqlanadi. */
export default function ListingListPage({ kind }) {
  const t = useT()
  const navigate = useNavigate()
  const isAuction = kind === 'auction'

  const [items, setItems] = useState(null)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      const data = isAuction ? await getAuctions() : await getRequests()
      setItems(data)
      setAlert('')
    } catch (err) {
      setAlert(errorMessage(err, t))
      setItems([])
    }
  }, [isAuction, t])

  useEffect(() => {
    load()
  }, [load])

  const newTo = isAuction ? '/auksion/yangi' : '/sorovlar/yangi'

  return (
    <PageShell>
      <Header
        title={t(isAuction ? 'auctions.title' : 'requests.title')}
        subtitle={t(isAuction ? 'auctions.subtitle' : 'requests.subtitle')}
      />

      <PullToRefresh onRefresh={load}>
        <main className="page">
          {alert && <div className="alert">{alert}</div>}

          {items === null && <ListingSkeleton />}

          {items !== null && items.length === 0 && !alert && (
            <EmptyState
              icon={isAuction ? GavelIcon : CartIcon}
              title={t(isAuction ? 'auctions.empty' : 'requests.empty')}
              text={t(isAuction ? 'auctions.emptyHint' : 'requests.emptyHint')}
            />
          )}

          {items !== null && items.length > 0 && (
            <motion.div variants={listContainer} initial="initial" animate="animate">
              {items.map((item) => (
                <ListingCard key={item.id} item={item} kind={kind} />
              ))}
            </motion.div>
          )}
        </main>
      </PullToRefresh>

      <motion.button
        type="button"
        className="fab"
        whileTap={tapSmall}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.15 }}
        onClick={() => navigate(newTo)}
        aria-label={t(isAuction ? 'auctions.new' : 'requests.new')}
      >
        <PlusIcon size={26} />
      </motion.button>
    </PageShell>
  )
}
