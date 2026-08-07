import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import { createAuction, errorMessage } from '../api.js'

const EMPTY = {
  farmer_name: '',
  product: '',
  quantity: '',
  price: '',
  phone: '',
  address: '',
}

export default function AuctionFormPage() {
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
    if (!form.farmer_name.trim()) next.farmer_name = 'Ismni kiriting'
    if (!form.product.trim()) next.product = 'Mahsulot nomini kiriting'
    if (!form.quantity) next.quantity = 'Miqdorni kiriting'
    else if (Number(form.quantity) <= 0) next.quantity = "Miqdor 0 dan katta bo'lishi kerak"
    if (form.price !== '' && Number(form.price) < 0) next.price = "Narx manfiy bo'lmasligi kerak"
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
      await createAuction({
        farmer_name: form.farmer_name.trim(),
        product: form.product.trim(),
        quantity: Number(form.quantity),
        price: form.price === '' ? null : Number(form.price),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
      })
      navigate('/')
    } catch (err) {
      setAlert(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Header title="Yangi auksion" subtitle="Mahsulotingizni e'lon qiling" backTo="/" />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Ism"
            name="farmer_name"
            value={form.farmer_name}
            onChange={handleChange}
            placeholder="Masalan: Alisher Rahimov"
            required
            error={errors.farmer_name}
          />
          <FormInput
            label="Mahsulot"
            name="product"
            value={form.product}
            onChange={handleChange}
            placeholder="Masalan: Pomidor"
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
            placeholder="Masalan: 2.5"
            required
            error={errors.quantity}
          />
          <FormInput
            label="Narxi (so'm/kg)"
            name="price"
            type="number"
            step="100"
            min="0"
            inputMode="numeric"
            value={form.price}
            onChange={handleChange}
            placeholder="Masalan: 12000"
            error={errors.price}
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
            placeholder="Masalan: Samarqand, Urgut tumani"
            error={errors.address}
          />

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Joylanmoqda...' : 'Auksionga joylashtirish'}
          </button>
        </form>
      </main>
    </>
  )
}
