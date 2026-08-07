import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import FormInput from '../components/FormInput.jsx'
import { EditIcon, MapPinIcon, PhoneIcon, TagIcon, UserIcon } from '../components/Icons.jsx'
import { createProfile, errorMessage, getProfile, updateProfile } from '../api.js'
import { ROLE_LABELS } from '../utils.js'

const STORAGE_KEY = 'agro_auksion_profile_id'

const ROLE_OPTIONS = [
  { value: 'dehqon', label: 'Dehqon' },
  { value: 'sotib_oluvchi', label: 'Sotib oluvchi' },
]

const EMPTY = { name: '', role: 'dehqon', phone: '', address: '' }

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    if (!savedId) {
      setLoading(false)
      return
    }

    let active = true
    getProfile(savedId)
      .then((data) => {
        if (!active) return
        setProfile(data)
        setForm({
          name: data.name,
          role: data.role,
          phone: data.phone,
          address: data.address || '',
        })
      })
      .catch((err) => {
        if (!active) return
        if (err?.response?.status === 404) {
          // Profil serverda o'chirilgan — localStorage'ni tozalaymiz.
          localStorage.removeItem(STORAGE_KEY)
        } else {
          setAlert(errorMessage(err))
        }
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Ismni kiriting'
    if (!form.phone.trim()) next.phone = 'Telefon raqamini kiriting'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlert('')
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      role: form.role,
      phone: form.phone.trim(),
      address: form.address.trim() || null,
    }

    setSaving(true)
    try {
      const saved = profile
        ? await updateProfile(profile.id, payload)
        : await createProfile(payload)
      localStorage.setItem(STORAGE_KEY, saved.id)
      setProfile(saved)
      setEditing(false)
      setToast('Profil saqlandi')
    } catch (err) {
      setAlert(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const showForm = !profile || editing

  return (
    <>
      <Header
        title="Profil"
        subtitle={showForm ? "Ma'lumotlaringizni kiriting" : "Shaxsiy ma'lumotlaringiz"}
      />

      <main className="page">
        {alert && <div className="alert">{alert}</div>}

        {loading && <div className="skeleton" style={{ height: 220 }} />}

        {!loading && showForm && (
          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Ism"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ismingiz va familiyangiz"
              required
              error={errors.name}
            />
            <FormInput
              label="Rol"
              name="role"
              value={form.role}
              onChange={handleChange}
              options={ROLE_OPTIONS}
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
              placeholder="Masalan: Farg'ona, Quva tumani"
              error={errors.address}
            />

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saqlanmoqda...' : 'Profilni saqlash'}
            </button>

            {profile && (
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 10 }}
                onClick={() => {
                  setEditing(false)
                  setErrors({})
                  setForm({
                    name: profile.name,
                    role: profile.role,
                    phone: profile.phone,
                    address: profile.address || '',
                  })
                }}
              >
                Bekor qilish
              </button>
            )}
          </form>
        )}

        {!loading && !showForm && (
          <>
            <div className="profile-head">
              <div className="avatar">{profile.name.trim().charAt(0).toUpperCase()}</div>
              <h2>{profile.name}</h2>
              <span className={`badge${profile.role === 'dehqon' ? '' : ' badge-orange'}`}>
                {ROLE_LABELS[profile.role] || profile.role}
              </span>
            </div>

            <div className="info-list">
              <div className="info-row">
                <PhoneIcon size={18} />
                <div>
                  <div className="k">Telefon</div>
                  <div className="v">{profile.phone}</div>
                </div>
              </div>
              <div className="info-row">
                <MapPinIcon size={18} />
                <div>
                  <div className="k">Manzil</div>
                  <div className="v">{profile.address || "Ko'rsatilmagan"}</div>
                </div>
              </div>
              <div className="info-row">
                <TagIcon size={18} />
                <div>
                  <div className="k">Rol</div>
                  <div className="v">{ROLE_LABELS[profile.role] || profile.role}</div>
                </div>
              </div>
              <div className="info-row">
                <UserIcon size={18} />
                <div>
                  <div className="k">Profil ID</div>
                  <div className="v" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                    {profile.id}
                  </div>
                </div>
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              <EditIcon size={17} /> Tahrirlash
            </button>
          </>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
