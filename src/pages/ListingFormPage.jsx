import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import ProductSelect from '../components/ProductSelect.jsx'
import ImagePicker from '../components/listing/ImagePicker.jsx'
import AuthRequired from '../components/AuthRequired.jsx'
import PageShell from '../components/PageShell.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { CheckIcon, CrownIcon, ShieldCheckIcon, VideoIcon } from '../components/Icons.jsx'
import {
  countMyListings,
  createOffer,
  createRequest,
  errorMessage,
  getOffer,
  getRequest,
  updateOffer,
  updateRequest,
  uploadListingImages,
} from '../services/index.js'
import { useLanguage } from '../i18n/index.jsx'
import { findProduct, findProductByName } from '../data/products.js'
import { moveImages, setImages } from '../listings/images.js'
import { tap } from '../motion.js'
import { canPostOffer, hasFeature, limitFor, reachedLimit } from '../plans.js'
import useCurrentUser from '../currentUser.jsx'
import {
  formatMoneyInput,
  formatPhoneInput,
  isPhoneComplete,
  moneyToNumber,
  REGIONS,
  regionLabel,
} from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/** Izoh uzunligi chegarasi (serverda 2000, bu yerda qattiqroq). */
const NOTES_MAX = 500

/** Miqdor birligi. Serverga har doim tonnada yuboriladi. */
const UNITS = [
  { id: 'ton', labelKey: 'units.ton', toTons: (n) => n, fromTons: (n) => n },
  { id: 'kg', labelKey: 'units.kg', toTons: (n) => n / 1000, fromTons: (n) => n * 1000 },
]

const EMPTY = {
  name: '',
  product: '', // mahsulot turining `id` si (src/data/products.js)
  quantity: '',
  unit: 'ton',
  price: '',
  phone: '',
  region: '',
  district: '',
  notes: '',
}

/** Manzil matnini viloyat + tuman qismlariga ajratadi (tahrirlash uchun). */
function splitAddress(address) {
  if (!address) return { region: '', district: '' }
  const match = REGIONS.find((r) => address.startsWith(r.uz) || address.startsWith(r.ru))
  if (!match) return { region: '', district: address }
  const rest = address.slice((address.startsWith(match.uz) ? match.uz : match.ru).length)
  return { region: match.uz, district: rest.replace(/^[,\s]+/, '') }
}

/**
 * E'lon qo'shish / tahrirlash — bitta sahifada, barcha maydonlar ko'rinib
 * turadi.
 *
 * Ilgari bu uch qadamli sehrgar edi (mahsulot → narx → aloqa). Qadamlar,
 * indikator va oldinga/orqaga tugmalari butunlay olib tashlandi: qisqa
 * formada ular faqat ortiqcha bosish talab qilardi va foydalanuvchi
 * to'ldirilgan ma'lumotni bir ko'rishda ko'ra olmasdi.
 */
export default function ListingFormPage({ kind }) {
  useLogMount('ListingFormPage')
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const { user, loading: userLoading } = useCurrentUser()

  const isOffer = kind === 'offer'
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [photos, setPhotos] = useState([])
  // MOCK: Premium tarifdagi qisqa video — hozircha faqat fayl nomi saqlanadi.
  const [video, setVideo] = useState(null)
  const videoRef = useRef(null)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingItem, setLoadingItem] = useState(isEdit)
  const prefilledRef = useRef(false)

  const listTo = isOffer ? '/' : '/sorovlar'

  // Tahrirlash rejimi — mavjud e'lonni yuklaymiz.
  useEffect(() => {
    if (!isEdit) return undefined
    let active = true
    const fetcher = isOffer ? getOffer : getRequest

    fetcher(id)
      .then((data) => {
        if (!active) return
        prefilledRef.current = true
        const { region, district } = splitAddress(data.address)
        setForm({
          name: (isOffer ? data.farmer_name : data.buyer_name) || '',
          product: findProductByName(data.product)?.id ?? '',
          quantity: String(data.quantity ?? ''),
          unit: 'ton',
          price: formatMoneyInput(isOffer ? data.price : data.offer_price),
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
  }, [id, isEdit, isOffer, t])

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

  /** Barcha majburiy maydonlar bir vaqtda tekshiriladi. */
  const validate = () => {
    const next = {}
    if (!form.product) next.product = t('form.errProduct')

    if (!form.quantity) next.quantity = t('form.errQuantity')
    else if (!(Number(form.quantity) > 0)) next.quantity = t('form.errQuantityPositive')

    const price = moneyToNumber(form.price)
    if (price === null) next.price = t('form.errPriceRequired')
    else if (price < 0) next.price = t('form.errPrice')

    if (!form.region) next.region = t('form.errRegion')

    if (!form.name.trim()) next.name = t('form.errName')

    if (!form.phone.replace(/\D/g, '').replace(/^998/, '')) next.phone = t('form.errPhone')
    else if (!isPhoneComplete(form.phone)) next.phone = t('form.errPhoneFormat')

    setErrors(next)
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert('')

    const problems = validate()
    if (Object.keys(problems).length) {
      log.front('Forma to\'ldirilmagan', Object.keys(problems))
      // Birinchi xatoli maydonga olib boramiz.
      const first = document.querySelector('.field-box.invalid, .field-msg.is-error')
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }

    const unit = UNITS.find((u) => u.id === form.unit) ?? UNITS[0]
    const regionEntry = REGIONS.find((r) => r.uz === form.region)
    const address =
      [regionEntry ? regionLabel(regionEntry, lang) : '', form.district.trim()]
        .filter(Boolean)
        .join(', ') || null

    const payload = {
      // Bazaga kanonik (o'zbekcha) nom yoziladi — statistika ranglari va
      // qidiruv shu nom bo'yicha ishlaydi; `product_id` esa barqaror kalit.
      product: findProduct(form.product)?.uz ?? '',
      product_id: form.product,
      quantity: unit.toTons(Number(form.quantity)),
      phone: form.phone.trim(),
      address,
      notes: form.notes.trim() || null,
      [isOffer ? 'farmer_name' : 'buyer_name']: form.name.trim(),
      [isOffer ? 'price' : 'offer_price']: moneyToNumber(form.price),
      // MOCK: video fayli yuklanmaydi — e'londa faqat belgi ko'rinadi.
      has_video: Boolean(video),
    }

    log.front('Forma yuborildi', { kind, isEdit, ...payload })

    setSaving(true)
    try {
      const saved = isEdit
        ? await (isOffer ? updateOffer(id, payload) : updateRequest(id, payload))
        : await (isOffer ? createOffer(payload) : createRequest(payload))

      const savedId = saved?.id ?? id

      /*
       * Rasmlar alohida yuboriladi. Server hozircha ularni qabul qilmaydi,
       * shuning uchun xato bo'lsa e'lonning o'zi baribir saqlanadi va
       * rasmlar hech bo'lmasa shu sessiyada ko'rinib turadi.
       * TODO: Upload listing images to backend — services/mock/listings.js dagi uploadListingImages().
       */
      if (photos.length && savedId) {
        setImages(savedId, photos)
        moveImages(id, savedId)
        try {
          await uploadListingImages(savedId, photos.map((p) => p.file).filter(Boolean))
        } catch (err) {
          log.front.error("Rasmlarni yuklab bo'lmadi (server qo'llab-quvvatlamaydi)", err)
        }
      }

      log.front(isEdit ? 'E\'lon yangilandi' : 'E\'lon yaratildi', { product: payload.product })
      // Ro'yxatga qaytamiz va u yerda muvaffaqiyat xabari ko'rsatiladi.
      navigate(listTo, {
        replace: true,
        state: { toast: t(isEdit ? 'listing.updated' : 'listing.created') },
      })
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.front.error('E\'lonni saqlab bo\'lmadi', err)
      setSaving(false)
    }
  }

  const title = isEdit ? t('common.edit') : t(isOffer ? 'offers.new' : 'requests.new')

  /* ----------------------------- Holatlar ----------------------------- */

  if (!userLoading && !user) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <AuthRequired text={t(isOffer ? 'auth.needOffer' : 'auth.needRequest')} />
        </main>
      </PageShell>
    )
  }

  /*
   * Ikki to'siq — faqat yangi e'lon uchun (tahrirlashda emas):
   *   1. Dehqonlar doskasiga faqat e-ijara orqali tasdiqlangan dehqon yozadi;
   *   2. Tarif chegarasi (Default 5/5, Premium 20/25).
   */
  if (!isEdit && user && isOffer && !canPostOffer(user)) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <EmptyState
            icon={ShieldCheckIcon}
            title={t('verify.neededTitle')}
            text={t('verify.neededText')}
            action={
              <motion.button
                type="button"
                className="btn btn-primary"
                whileTap={tap}
                onClick={() => navigate('/tasdiqlash')}
              >
                <ShieldCheckIcon size={17} />
                {t('verify.submit')}
              </motion.button>
            }
          />
        </main>
      </PageShell>
    )
  }

  if (!isEdit && user && reachedLimit(user, kind, countMyListings(kind, user.id))) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <EmptyState
            icon={CrownIcon}
            title={t('plan.limitTitle')}
            text={t('plan.limitText', { limit: limitFor(user, kind) })}
            action={
              <motion.button
                type="button"
                className="btn btn-primary"
                whileTap={tap}
                onClick={() => navigate('/premium')}
              >
                <CrownIcon size={17} />
                {t('plan.seePlans')}
              </motion.button>
            }
          />
        </main>
      </PageShell>
    )
  }

  if (userLoading || loadingItem) {
    return (
      <PageShell variant="slide" width="form">
        <Header title={title} backTo={listTo} backLabel={t('common.back')} />
        <main className="page">
          <BlockSkeleton height={420} />
        </main>
      </PageShell>
    )
  }

  const notesLeft = NOTES_MAX - form.notes.length

  return (
    <PageShell variant="slide" width="form">
      <Header
        title={title}
        subtitle={t(isOffer ? 'offers.newSubtitle' : 'requests.newSubtitle')}
        backTo={listTo}
        backLabel={t('common.back')}
      />

      <main className="page has-sticky-foot">
        {alert && <div className="alert">{alert}</div>}

        <form onSubmit={handleSubmit} noValidate className="form-card">
          {/* 1. Mahsulot nomi */}
          <ProductSelect
            label={t('listing.product')}
            value={form.product}
            onChange={set('product')}
            placeholder={t('form.productPlaceholder')}
            error={errors.product}
          />

          {/* 2. Miqdori + birlik */}
          <div className="field-pair">
            <FormInput
              label={t('listing.quantity')}
              name="quantity"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder={t('form.quantityPlaceholder')}
              required
              error={errors.quantity}
            />
            <FormInput
              label={t('listing.unit')}
              name="unit"
              value={form.unit}
              onChange={set('unit')}
              options={UNITS.map((u) => ({ value: u.id, label: t(u.labelKey) }))}
            />
          </div>

          {/* 3. Narxi */}
          <FormInput
            label={t(isOffer ? 'listing.price' : 'listing.offerPrice')}
            name="price"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => set('price')(formatMoneyInput(e.target.value))}
            placeholder={t('form.pricePlaceholder')}
            suffix={t('units.somPerKg')}
            required
            error={errors.price}
          />

          {/* 4. Manzil */}
          <div className="field-pair">
            <FormInput
              label={t('form.region')}
              name="region"
              value={form.region}
              onChange={set('region')}
              required
              error={errors.region}
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
          </div>

          {/* 5. Aloqa */}
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

          {/* 6. Izoh — ixtiyoriy, belgilar hisoblagichi bilan */}
          <div className="field">
            <label className="field-label" htmlFor="listing-notes">
              {t('listing.notes')}
              <span className="field-optional">{t('common.optional')}</span>
            </label>
            <div className="field-box">
              <textarea
                id="listing-notes"
                name="notes"
                className="control"
                rows={4}
                maxLength={NOTES_MAX}
                value={form.notes}
                onChange={set('notes')}
                placeholder={t('form.notesPlaceholder')}
              />
            </div>
            <p className={`field-msg field-counter${notesLeft < 40 ? ' is-low' : ''}`}>
              <span>{t('form.notesHint')}</span>
              <span className="num">
                {form.notes.length}/{NOTES_MAX}
              </span>
            </p>
          </div>

          {/* 7. Rasmlar — ixtiyoriy */}
          <ImagePicker images={photos} onChange={setPhotos} />

          {/* 8. Qisqa video — Premium xususiyati. */}
          {hasFeature(user, 'video') && (
            <div className="field">
              <span className="field-label">{t('listing.video')}</span>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              />
              <motion.button
                type="button"
                className="btn btn-ghost"
                whileTap={tap}
                onClick={() => videoRef.current?.click()}
              >
                <VideoIcon size={16} />
                {video ? video.name : t('listing.videoPick')}
              </motion.button>
            </div>
          )}
        </form>
      </main>

      {/* Tasdiqlash — ekran pastida doim ko'rinib turadi. */}
      <div className="form-foot">
        <motion.button
          type="button"
          className="btn btn-fire"
          whileTap={tap}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner" />
              {t(isOffer ? 'offers.submitting' : 'requests.submitting')}
            </>
          ) : (
            <>
              <CheckIcon size={16} />
              {t('listing.confirm')}
            </>
          )}
        </motion.button>
      </div>
    </PageShell>
  )
}
