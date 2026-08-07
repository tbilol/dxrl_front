import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import { createRequest, errorMessage } from '../api.js'

const EMPTY = {
  buyer_name: '',
  product: '',
  quantity: '',
  offer_price: '',
  phone: '',
  address: '',
}

export default function RequestFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.buyer_name.trim()) next.buyer_name = 'Ismni kiriting'
    if (!form.product.trim()) next.product = 'Mahsulot nomini kiriting'
    if (!form.quantity) next.quantity = 'Miqdorni kiriting'
    else if (Number(form.quantity) <= 0) next.quantity = "Miqdor 0 dan katta bo'lishi kerak"
    if (form.offer_price !== '' && Number(form.offer_price) < 0) {
      next.offer_price = "Narx manfiy bo'lmasligi kerak"
    }
    if (!form.phone.trim()) next.phone = 'Telefon raqamini kiriting'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert('')
    if (!validate()) return

    setSaving(true)
    try {
      await createRequest({
        buyer_name: form.buyer_name.trim(),
        product: form.product.trim(),
        quantity: Number(form.quantity),
        offer_price: form.offer_price === '' ? null : Number(form.offer_price),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
      })
      navigate('/sorovlar')
    } catch (err) {
      setAlert(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header
        title="Yangi so'rov"
        subtitle="Kerakli mahsulotni e'lon qiling"
        backTo="/sorovlar"
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Ism"
            name="buyer_name"
            value={form.buyer_name}
            onChange={handleChange}
            placeholder="Masalan: Dilnoza Karimova"
            required
            error={errors.buyer_name}
          />
          <FormInput
            label="Mahsulot"
            name="product"
            value={form.product}
            onChange={handleChange}
            placeholder="Masalan: Bug'doy"
            required
            error={errors.product}
          />
          <FormInput
            label="Miqdori (tonna)"
            name="quantity"
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Masalan: 5"
            required
            error={errors.quantity}
          />
          <FormInput
            label="Taklif narxi (so'm/kg)"
            name="offer_price"
            type="number"
            step="100"
            min="0"
            inputMode="numeric"
            value={form.offer_price}
            onChange={handleChange}
            placeholder="Masalan: 9000"
            error={errors.offer_price}
          />
          <FormInput
            label="Telefon"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+998 90 123 45 67"
            required
            error={errors.phone}
          />
          <FormInput
            label="Manzil"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Masalan: Toshkent shahri"
            error={errors.address}
          />

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Yuborilmoqda...' : "So'rovni yuborish"}
          </button>
        </form>
      </main>
    </>
  )
}
