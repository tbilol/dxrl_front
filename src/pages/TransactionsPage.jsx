import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import { ChevronRightIcon, HandshakeIcon } from '../components/Icons.jsx'
import { errorMessage, getTransactions, STEP_KEYS } from '../services/index.js'
import { localizeProduct } from '../data/products.js'
import { useLanguage } from '../i18n/index.jsx'
import { listContainerFor, listItem } from '../motion.js'
import useCurrentUser from '../currentUser.jsx'
import { formatDayShort, formatNumber } from '../utils.js'
import useLogMount from '../useLogMount.js'

/** Mening bitimlarim — ochiq va yakunlangan tranzaksiyalar. */
export default function TransactionsPage() {
  useLogMount('TransactionsPage')
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user, loading: userLoading } = useCurrentUser()

  const [items, setItems] = useState(null)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      setItems(await getTransactions())
    } catch (err) {
      setAlert(errorMessage(err, t))
      setItems([])
    }
  }, [t])

  useEffect(() => {
    if (user) load()
  }, [user, load])

  if (!userLoading && !user) {
    return (
      <PageShell variant="slide" width="mid">
        <Header title={t('tx.allTitle')} backTo="/profil" backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t('tx.authHint')} />
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell variant="slide" width="mid">
      <Header
        title={t('tx.allTitle')}
        subtitle={t('tx.allSubtitle')}
        backTo="/profil"
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        {items === null && <BlockSkeleton height={180} />}

        {items !== null && items.length === 0 && (
          <EmptyState icon={HandshakeIcon} title={t('tx.empty')} text={t('tx.emptyHint')} />
        )}

        {items !== null && items.length > 0 && (
          <motion.div variants={listContainerFor(items.length)} initial="initial" animate="animate">
            {items.map((tx) => {
              const partner = tx.my_role === 'farmer' ? tx.reseller : tx.farmer
              const done = tx.status === 'done'
              const stepKey = STEP_KEYS[tx.step] ?? 'payout'

              return (
                <motion.button
                  key={tx.id}
                  type="button"
                  className="tx-row"
                  variants={listItem}
                  whileTap={{ opacity: 0.7 }}
                  onClick={() => navigate(`/tranzaksiya/${tx.id}`)}
                >
                  <Avatar name={partner?.name} src={partner?.avatar_url} size={38} />

                  <span className="tx-row-body">
                    <span className="tx-row-top">
                      <span className="tx-row-product">{localizeProduct(tx.product, lang)}</span>
                      <span className={`badge${done ? ' badge-success' : ' badge-accent'}`}>
                        {t(done ? 'tx.statusDone' : `tx.step.${stepKey}`)}
                      </span>
                    </span>
                    <span className="tx-row-meta">
                      {partner?.name} · {formatNumber(tx.quantity)} {t('units.ton')} ·{' '}
                      <span className="num">{formatNumber(tx.total)}</span> {t('units.som')}
                    </span>
                  </span>

                  <span className="tx-row-side">
                    <span className="tx-row-date">{formatDayShort(tx.created_at, lang)}</span>
                    <ChevronRightIcon size={15} />
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </main>
    </PageShell>
  )
}
