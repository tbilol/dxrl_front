import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FormInput from '../components/FormInput.jsx'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import Toast from '../components/Toast.jsx'
import TransactionSteps from '../components/transaction/TransactionSteps.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import {
  AlertIcon,
  CameraIcon,
  CheckIcon,
  CoinsIcon,
  ScaleIcon,
} from '../components/Icons.jsx'
import {
  advanceTransaction,
  errorMessage,
  getTransaction,
  STEP_KEYS,
  STEPS,
  submitWeighbridgeReceipt,
} from '../services/index.js'
import { localizeProduct } from '../data/products.js'
import { useLanguage } from '../i18n/index.jsx'
import { tap, tapSmall } from '../motion.js'
import { formatNumber } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/**
 * TRANZAKSIYA — eskrov oqimi, yetti bosqich.
 *
 * Olib sotuvchi to'laydi → mablag' MCHJ hisobida ushlanadi → dehqon "to'lov
 * keldi" xabarini ko'radi → olib sotuvchi mahsulotni oladi → tarozi chekini
 * yuboradi → dehqon topshirganini tasdiqlaydi → olib sotuvchi qabul
 * qilganini tasdiqlaydi → mablag' dehqonga chiqariladi. Yakunda ikkala
 * tomon reytingi ko'tariladi va olib sotuvchiga bonus yoziladi.
 *
 * MOCK: barcha bosqichlar services/mock/transactions.js da — pul, chek
 * tekshiruvi va bonus hisoblash backend kelganda haqiqiy bo'ladi.
 */
export default function TransactionPage() {
  useLogMount('TransactionPage')
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()

  const [tx, setTx] = useState(null)
  const [alert, setAlert] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [receipt, setReceipt] = useState({ number: '', photoName: '' })
  const [receiptError, setReceiptError] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setTx(await getTransaction(id))
      setAlert('')
    } catch (err) {
      setAlert(errorMessage(err, t))
    }
  }, [id, t])

  useEffect(() => {
    load()
  }, [load])

  const stepKey = tx ? STEP_KEYS[tx.step] : null
  const actor = stepKey ? STEPS.find((s) => s.key === stepKey)?.actor : null
  const myTurn = Boolean(actor && (actor === tx?.my_role || actor === 'system'))

  const run = async (payload) => {
    setBusy(true)
    setAlert('')
    try {
      const next = stepKey === 'receipt'
        ? await submitWeighbridgeReceipt(id, payload)
        : await advanceTransaction(id, stepKey, payload)

      setTx(next)
      log.front('Tranzaksiya bosqichi bajarildi (MOCK)', { id, step: stepKey })

      if (next.status === 'done') {
        // MOCK: bonus mantig'i hali loyihalanmagan — hozircha xabar va reyting.
        setToast(t('tx.completedToast', { bonus: formatNumber(next.bonus) }))
      } else {
        setToast(t(`tx.doneToast.${stepKey}`))
      }
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setBusy(false)
    }
  }

  const submitReceipt = () => {
    if (!receipt.number.trim() && !receipt.photoName) {
      setReceiptError(t('tx.errReceipt'))
      return
    }
    setReceiptError('')
    run({ number: receipt.number.trim() || null, photoName: receipt.photoName || null })
  }

  /* ------------------------------ Holatlar ------------------------------ */

  if (alert && !tx) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={t('tx.title')} backTo="/tranzaksiyalar" backLabel={t('common.back')} />
        <main className="page">
          <EmptyState icon={AlertIcon} title={t('tx.notFound')} text={alert} />
        </main>
      </PageShell>
    )
  }

  if (!tx) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={t('tx.title')} backTo="/tranzaksiyalar" backLabel={t('common.back')} />
        <main className="page">
          <BlockSkeleton height={320} />
        </main>
      </PageShell>
    )
  }

  const done = tx.status === 'done'
  const partner = tx.my_role === 'farmer' ? tx.reseller : tx.farmer

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={t('tx.title')}
        subtitle={t('tx.subtitle', { product: localizeProduct(tx.product, lang) })}
        backTo="/tranzaksiyalar"
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        {/* ------------------------- Bitim ma'lumoti ------------------------- */}
        <section className="tx-card">
          <div className="tx-head">
            <div>
              <h2 className="tx-product">{localizeProduct(tx.product, lang)}</h2>
              <span className={`badge${done ? ' badge-success' : ' badge-accent'}`}>
                {t(done ? 'tx.statusDone' : 'tx.statusActive')}
              </span>
            </div>
            {partner && (
              <button
                type="button"
                className="tx-partner"
                onClick={() => navigate(`/profile/${partner.id}`)}
              >
                <Avatar name={partner.name} src={partner.avatar_url} size={34} />
                <span>
                  <span className="tx-partner-name">{partner.name}</span>
                  <span className="tx-partner-role">
                    {t(tx.my_role === 'farmer' ? 'tx.roleReseller' : 'tx.roleFarmer')}
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="tx-figures">
            <span className="tx-figure">
              <ScaleIcon size={14} />
              <span className="num">
                {formatNumber(tx.quantity)} {t('units.ton')}
              </span>
            </span>
            <span className="tx-figure">
              <CoinsIcon size={14} />
              <span className="num">
                {formatNumber(tx.total)} {t('units.som')}
              </span>
            </span>
          </div>

          {tx.escrow_held && !done && <p className="tx-escrow">{t('tx.escrowHeld')}</p>}
          {tx.receipt?.verified && (
            <p className="tx-escrow is-ok">
              <CheckIcon size={13} />
              {t('tx.receiptVerified', { number: tx.receipt.number || t('tx.receiptPhoto') })}
            </p>
          )}
        </section>

        {/* ---------------------------- Bosqichlar --------------------------- */}
        <TransactionSteps step={tx.step} status={tx.status} />

        {/* ------------------------------ Amal ------------------------------- */}
        {done ? (
          <div className="tx-done">
            <span className="tx-done-mark" aria-hidden="true">
              <CheckIcon size={20} />
            </span>
            <h3 className="tx-done-title">{t('tx.completedTitle')}</h3>
            <p className="tx-done-text">{t('tx.completedText')}</p>
            <p className="tx-done-bonus num">{t('tx.bonus', { value: formatNumber(tx.bonus) })}</p>
            <motion.button
              type="button"
              className="btn btn-secondary"
              whileTap={tap}
              onClick={() => navigate('/tranzaksiyalar')}
            >
              {t('tx.allTitle')}
            </motion.button>
          </div>
        ) : (
          <div className="tx-action">
            <h3 className="tx-action-title">{t(`tx.step.${stepKey}`)}</h3>
            <p className="tx-action-text">{t(`tx.stepHint.${stepKey}`)}</p>

            {stepKey === 'receipt' && myTurn && (
              <>
                <FormInput
                  label={t('tx.receiptNumber')}
                  name="receipt"
                  value={receipt.number}
                  onChange={(e) => {
                    setReceipt((prev) => ({ ...prev, number: e.target.value }))
                    setReceiptError('')
                  }}
                  placeholder={t('tx.receiptPlaceholder')}
                  hint={t('tx.receiptHint')}
                  error={receiptError}
                />

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setReceipt((prev) => ({ ...prev, photoName: file.name }))
                      setReceiptError('')
                    }
                  }}
                />

                <motion.button
                  type="button"
                  className="btn btn-ghost"
                  whileTap={tapSmall}
                  onClick={() => fileRef.current?.click()}
                >
                  <CameraIcon size={16} />
                  {receipt.photoName || t('tx.receiptPhotoPick')}
                </motion.button>
              </>
            )}

            {myTurn ? (
              <motion.button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 'var(--s-3)' }}
                whileTap={tap}
                onClick={() => (stepKey === 'receipt' ? submitReceipt() : run({}))}
                disabled={busy}
              >
                {busy ? <span className="spinner" /> : <CheckIcon size={17} />}
                {busy ? t('tx.processing') : t(`tx.action.${stepKey}`)}
              </motion.button>
            ) : (
              <>
                <p className="tx-waiting">{t('tx.waiting')}</p>
                {/* MOCK: ikkinchi tomon hozircha yo'q — bosqichni u nomidan
                    o'tkazish uchun sinov tugmasi. Backend kelganda olib tashlanadi. */}
                <motion.button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  whileTap={tapSmall}
                  onClick={() => run({})}
                  disabled={busy}
                >
                  {busy ? <span className="spinner dark" /> : null}
                  {t('tx.simulate')}
                </motion.button>
              </>
            )}
          </div>
        )}
      </main>

      <Toast message={toast} onDone={() => setToast('')} duration={3200} />
    </PageShell>
  )
}
