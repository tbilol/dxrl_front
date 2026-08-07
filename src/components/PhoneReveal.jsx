import { useState } from 'react'
import { PhoneIcon } from './Icons.jsx'

export default function PhoneReveal({ phone }) {
  const [shown, setShown] = useState(false)

  if (!shown) {
    return (
      <button type="button" className="phone-btn" onClick={() => setShown(true)}>
        <PhoneIcon size={17} />
        Aloqaga chiqish
      </button>
    )
  }

  return (
    <div className="phone-revealed">
      <a href={`tel:${phone}`}>
        <PhoneIcon size={15} /> {phone}
      </a>
      <button type="button" className="phone-hide" onClick={() => setShown(false)}>
        Yashirish
      </button>
    </div>
  )
}
