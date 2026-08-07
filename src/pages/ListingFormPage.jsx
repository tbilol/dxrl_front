import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import Stepper from '../components/Stepper.jsx'
import ProductAutocomplete from '../components/ProductAutocomplete.jsx'
import StepProgress from '../components/StepProgress.jsx'
import SuccessCheck from '../components/SuccessCheck.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../components/Icons.jsx'
import {
  createAuction,
  createRequest,
  errorMessage,
  getAuction,
  getRequest,
  updateAuction,
  updateRequest,
} from '../api.js'
import { useLanguage } from '../i18n/index.jsx'
import { stepVariants, tap } from '../motion.js'
import useCurrentUser from '../useCurrentUser.js'
import {
  formatMoneyInput,
  formatPhoneInput,
  isPhoneComplete,
  moneyToNumber,
  REGIONS,
  regionLabel,
} from '../utils.js'

const TOTAL_STEPS = 3

const EMPTY = {
  name: '',
  product: '',
  quantity: '',
  price: '',
  phone: '',
  region: '',
  district: '',
  notes: '',
}

/** Manzil matnini viloyat + tuman qismlariga ajratadi (tahrirlash uchun). */
function splitAddress(address) {
  if (!address) return { region: '', district: '' }
  const match = REGIONS.find(
    (r) => address.startsWith(r.uz) || address.startsWith(r.ru),
  )
  if (!match) return { region: '', district: address }
  const rest = address.slice((address.startsWith(match.uz) ? match.uz : match.ru).length)
  return { region: match.uz, district: rest.replace(/^[,\s]+/, '') }
}

export default function ListingFormPage({ kind }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user, loading: userLoading } = useCurrentUser()

  const isAuction = kind === 'auction'
  const isEdit = Boolean(id)

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [loadingItem, setLoadingItem] = useState(isEdit)
  const prefilledRef = useRef(false)

  const listTo = isAuction ? '/' : '/sorovlar'

  // Tahrirlash rejimi — mavjud e'lonni yuklaymiz.
  useEffect(() => {
    if (!isEdit) return undefined
    let active = true
    const fetcher = isAuction ? getAuction : getRequest

    fetcher(id)
      .then((data) => {
        if (!active) return
        prefilledRef.current = true
        const { region, district } = splitAddress(data.address)
        setForm({
          name: (isAuction ? data.farmer_name : data.buyer_name) || '',
          product: data.product || '',
          quantity: String(data.quantity ?? ''),
          price: formatMoneyInput(isAuction ? data.price : data.offer_price),
          phone: formatPhoneInput(data.phone || ''),
          region,
          district,
          notes: data.notes || '',
        })
      })
      .catch((err) => active && setAlert(errorMessage(err, t)))
      .finally(() => active && setLoadingItem(false))

    return () => {
      active = false
    }
  }, [id, isEdit, isAuction, t])

  // Yaratish rejimi — profildan ism/telefon/manzilni avtomatik to'ldiramiz.
  useEffect(() => {
    if (isEdit || !user || prefilledRef.current) return
    prefilledRef.current = true
    const { region, district } = splitAddress(user.address)
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || (user.phone ? formatPhoneInput(user.phone) : ''),
      region: prev.region || region,
      district: prev.district || district,
    }))
  }, [user, isEdit])

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateStep = (which) => {
    const next = {}
    if (which === 1) {
      if (!form.product.trim()) next.product = t('form.errProduct')
      if (!form.quantity) next.quantity = t('form.errQuantity')
      else if (Number(form.quantity) <= 0) next.quantity = t('form.errQuantityPositive')
    }
    if (which === 2) {
      const price = moneyToNumber(form.price)
      if (price !== null && price < 0) next.price = t('form.errPrice')
    }
    if (which === 3) {
      if (!form.name.trim()) next.name = t('form.errName')
      if (!form.phone.replace(/\D/g, '').replace(/^998/, '')) next.phone = t('form.errPhone')
      else if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setDir(1)
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  const goBack = () => {
    setDir(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert('')
    if (!validateStep(3)) return

    const regionEntry = REGIONS.find((r) => r.uz === form.region)
    const address =
      [regionEntry ? regionLabel(regionEntry, lang) : '', form.district.trim()]
        .filter(Boolean)
        .join(', ') || null

    const payload = {
      product: form.product.trim(),
      quantity: Number(form.quantity),
      phone: form.phone.trim(),
      address,
      notes: form.notes.trim() || null,
      [isAuction ? 'farmer_name' : 'buyer_name']: form.name.trim(),
      [isAuction ? 'price' : 'offer_price']: moneyToNumber(form.price),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await (isAuction ? updateAuction(id, payload) : updateRequest(id, payload))
      } else {
        await (isAuction ? createAuction(payload) : createRequest(payload))
      }
      setDone(true)
      setTimeout(() => navigate(listTo), 1500)
    } catch (err) {
      setAlert(errorMessage(err, t))
      setSaving(false)
    }
  }

  const title = isEdit
    ? t('common.edit')
    : t(isAuction ? 'auctions.new' : 'requests.new')

  /* ----------------------------- Holatlar ----------------------------- */

  if (!userLoading && !user) {
    return (
      <PageShell variant="slide">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t(isAuction ? 'auth.needAuction' : 'auth.needRequest')} />
        </main>
      </PageShell>
    )
  }

  if (userLoading || loadingItem) {
    return (
      <PageShell variant="slide">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <BlockSkeleton height={280} />
        </main>
      </PageShell>
    )
  }

  if (done) {
    return (
      <PageShell variant="slide">
        <Header title={title} />
        <main className="page">
          <SuccessCheck
            title={
              isEdit
                ? t('listing.updated')
                : t(isAuction ? 'auctions.created' : 'requests.created')
            }
            subtitle={t(isAuction ? 'auctions.subtitle' : 'requests.subtitle')}
          />
        </main>
      </PageShell>
    )
  }

  const stepLabels = [t('form.step1'), t('form.step2'), t('form.step3')]

  return (
    <PageShell variant="slide">
      <Header
        title={title}
        subtitle={t(isAuction ? 'auctions.newSubtitle' : 'requests.newSubtitle')}
        backTo={listTo}
        backLabel={t('common.back')}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        <StepProgress current={step} total={TOTAL_STEPS} labels={stepLabels} />

        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {/* ---------------------- 1-qadam: mahsulot ---------------------- */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="leave"
              >
                <ProductAutocomplete
                  label={t('listing.product')}
                  value={form.product}
                  onChange={set('product')}
                  placeholder={t('form.productPlaceholder')}
                  error={errors.product}
                />

                <Stepper
                  label={t('listing.quantity')}
                  value={form.quantity}
                  onChange={set('quantity')}
                  step={0.5}
                  suffix={t('units.ton')}
                  error={errors.quantity}
                />
              </motion.div>
            )}

            {/* ------------------------ 2-qadam: narx ------------------------ */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="leave"
              >
                <FormInput
                  label={t(isAuction ? 'listing.price' : 'listing.offerPrice')}
                  name="price"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set('price')(formatMoneyInput(e.target.value))}
                  placeholder={t('form.pricePlaceholder')}
                  suffix={t('units.somPerKg')}
                  hint={t('form.priceHint')}
                  error={errors.price}
                />
              </motion.div>
            )}

            {/* ----------------- 3-qadam: aloqa va izoh ---------------------- */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="leave"
              >
                <FormInput
                  label={t('form.yourName')}
                  name="name"
                  value={form.name}
                  onChange={set('name')}
                  placeholder={t('form.namePlaceholder')}
                  required
                  error={errors.name}
                  autoComplete="name"
                />

                <FormInput
                  label={t('listing.phone')}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set('phone')(formatPhoneInput(e.target.value))}
                  onFocus={() => !form.phone && set('phone')('+998 ')}
                  placeholder={t('form.phonePlaceholder')}
                  required
                  error={errors.phone}
                  autoComplete="tel"
                />

                <FormInput
                  label={t('form.region')}
                  name="region"
                  value={form.region}
                  onChange={set('region')}
                  options={[
                    { value: '', label: t('form.regionSelect') },
                    ...REGIONS.map((r) => ({ value: r.uz, label: regionLabel(r, lang) })),
                  ]}
                />

                <FormInput
                  label={t('form.district')}
                  name="district"
                  value={form.district}
                  onChange={set('district')}
                  placeholder={t('form.districtPlaceholder')}
                />

                <FormInput
                  label={t('listing.notes')}
                  name="notes"
                  textarea
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder={t('form.notesPlaceholder')}
                  hint={t('form.notesHint')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --------------------------- Boshqaruv --------------------------- */}
          <div className="btn-row" style={{ marginTop: 'var(--sp-5)' }}>
            {step > 1 && (
              <motion.button
                type="button"
                className="btn btn-ghost"
                whileTap={tap}
                onClick={goBack}
              >
                <ArrowLeftIcon size={17} />
                {t('common.prev')}
              </motion.button>
            )}

            {step < TOTAL_STEPS ? (
              <motion.button
                type="button"
                className="btn btn-primary"
                whileTap={tap}
                onClick={goNext}
              >
                {t('common.next')}
                <ArrowRightIcon size={17} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                className="btn btn-primary"
                whileTap={tap}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner" />
                    {t(isAuction ? 'auctions.submitting' : 'requests.submitting')}
                  </>
                ) : (
                  <>
                    <CheckIcon size={18} />
                    {isEdit
                      ? t('common.save')
                      : t(isAuction ? 'auctions.submit' : 'requests.submit')}
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </main>
    </PageShell>
  )
}
