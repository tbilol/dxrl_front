/**
 * MOCK: brauzer xotirasidagi "baza".
 *
 * Backend hali yo'q (u keyinchalik mikroservislar ko'rinishida yoziladi),
 * shuning uchun barcha ma'lumot shu yerda yashaydi va localStorage ga
 * saqlanadi — sahifa yangilansa ham e'lonlar, suhbatlar va tranzaksiyalar
 * joyida qoladi.
 *
 * Bu yagona holat manbai: `src/services/` ichidagi hamma funksiya faqat shu
 * fayl bilan gaplashadi. Haqiqiy API ulanganda butun `mock/` papkasi
 * o'chiriladi — sahifalar `src/services/index.js` dan import qilgani uchun
 * ularga tegilmaydi.
 */

import { PRODUCTS as CATALOG } from '../../data/products.js'
import log from '../../logger.js'
import { isoDaysAgo, nowIso, pick, rng, round1, uid } from './util.js'

const STORAGE_KEY = 'agrogram_mock_db'
const VERSION = 2

/* --------------------------- Namuna ma'lumotlar -------------------------- */

/*
 * Namuna e'lonlar faqat KATALOGDAGI mahsulotlardan tuziladi
 * (src/data/products.js) — foydalanuvchi ham faqat shu turlarni tanlay
 * oladi, demak lentadagi va formadagi ro'yxat bir xil bo'ladi.
 *
 * Bu yerda har bir mahsulotga o'rtacha narx (so'm/kg) va hajm (tonna)
 * biriktiriladi — namuna ma'lumot haqiqiyga o'xshasin.
 */
const MARKET = {
  /* Don va texnika */
  bugdoy: [4500, 60],
  arpa: [3600, 58],
  sholi: [9500, 38],
  makkajoxori: [3800, 52],
  paxta: [12500, 44],
  kungaboqar: [9000, 16],
  kunjut: [14000, 9],
  beda: [2800, 40],

  /* Sabzavot */
  kartoshka: [6000, 50],
  sabzi: [5000, 34],
  piyoz: [4200, 56],
  sarimsoq: [13000, 8],
  pomidor: [9000, 26],
  bodring: [10000, 17],
  karam: [3500, 42],
  qalampir: [12000, 11],
  'achchiq-qalampir': [15000, 6],
  baqlajon: [8000, 14],
  qovoq: [3200, 38],
  turp: [3400, 20],
  lavlagi: [3900, 30],

  /* Dukkakli */
  mosh: [13500, 14],
  noxat: [11000, 14],
  loviya: [12000, 12],

  /* Poliz */
  qovun: [5200, 47],
  tarvuz: [3000, 70],

  /* Meva */
  uzum: [14500, 20],
  olma: [11000, 28],
  nok: [12500, 16],
  behi: [8500, 12],
  shaftoli: [10500, 15],
  orik: [13000, 12],
  gilos: [22000, 7],
  olcha: [18000, 8],
  olxori: [9500, 14],
  anor: [12000, 17],
  xurmo: [11500, 13],
  anjir: [20000, 5],
  tut: [9000, 6],
  limon: [16000, 9],
  qulupnay: [25000, 4],

  /* Yong'oq */
  yongoq: [60000, 3],
  bodom: [55000, 3],
  pista: [80000, 2],
}

const PRODUCTS = CATALOG.map((product) => {
  const [price, quantity] = MARKET[product.id] ?? [6000, 30]
  return [product.uz, price, quantity]
})

const PLACES = [
  ['Samarqand', 'Urgut tumani'],
  ['Andijon', 'Asaka tumani'],
  ["Farg'ona", 'Quva tumani'],
  ['Namangan', 'Chust tumani'],
  ['Buxoro', "G'ijduvon tumani"],
  ['Qashqadaryo', 'Shahrisabz tumani'],
  ['Surxondaryo', 'Denov tumani'],
  ['Xorazm', 'Xiva tumani'],
  ['Toshkent viloyati', 'Parkent tumani'],
  ['Jizzax', 'Zomin tumani'],
]

const FARMER_NAMES = [
  'Anvar Qodirov', 'Bekzod Tursunov', 'Dilshod Ergashev', 'Gulnora Sattorov',
  "Farrux Yo'ldoshev", 'Hasan Rahimov', 'Ibrohim Nazarov', 'Jasur Olimov',
  'Kamola Sharipov', 'Mirzo Ashurov', 'Nodira Ismoilov', 'Otabek Karimov',
]

const RESELLER_NAMES = [
  'Agro Savdo MChJ', 'Bahor Trade', 'Global Agro Export', 'Humo Logistics',
  'Iqbol Market', 'Jahon Foods', 'Nur Distribution', 'Registon Group',
  'Samo Invest', 'Toshkent Savdo',
]

const PHONES = [
  '+998 90 123 45 67', '+998 91 234 56 78', '+998 93 345 67 89',
  '+998 94 456 78 90', '+998 97 567 89 01', '+998 99 678 90 12',
]

function makeProfiles() {
  const rand = rng(7)
  const farmers = FARMER_NAMES.map((name, i) => {
    const [region, district] = PLACES[i % PLACES.length]
    return {
      id: `dehqon-${i + 1}`,
      name,
      role: 'dehqon',
      phone: pick(rand, PHONES),
      email: null,
      avatar_url: null,
      address: `${region}, ${district}`,
      // MOCK: reyting backendda tranzaksiyalardan hisoblanadi.
      rating: round1(3.8 + rand() * 1.2),
      rating_count: 4 + Math.floor(rand() * 40),
      deals_count: 2 + Math.floor(rand() * 25),
      is_premium: rand() > 0.7,
      is_verified_farmer: true,
      has_password: true,
      has_google: false,
      has_apple: false,
      followers_count: Math.floor(rand() * 240),
      following_count: Math.floor(rand() * 90),
    }
  })

  const resellers = RESELLER_NAMES.map((name, i) => {
    const [region, district] = PLACES[(i + 3) % PLACES.length]
    return {
      id: `sotuvchi-${i + 1}`,
      name,
      role: 'sotib_oluvchi',
      phone: pick(rand, PHONES),
      email: null,
      avatar_url: null,
      address: `${region}, ${district}`,
      rating: round1(3.9 + rand() * 1.1),
      rating_count: 6 + Math.floor(rand() * 50),
      deals_count: 5 + Math.floor(rand() * 40),
      is_premium: rand() > 0.6,
      is_verified_farmer: false,
      has_password: true,
      has_google: false,
      has_apple: false,
      followers_count: Math.floor(rand() * 300),
      following_count: Math.floor(rand() * 120),
    }
  })

  return [...farmers, ...resellers]
}

function makeListings(profiles) {
  const rand = rng(1337)
  const farmers = profiles.filter((p) => p.role === 'dehqon')
  const resellers = profiles.filter((p) => p.role === 'sotib_oluvchi')
  const out = []

  const build = (kind, people, count, seedOffset) => {
    for (let i = 0; i < count; i += 1) {
      const [product, basePrice, baseQty] = pick(rand, PRODUCTS)
      const person = people[(i + seedOffset) % people.length]
      const price = Math.round((basePrice * (0.85 + rand() * 0.3)) / 50) * 50
      out.push({
        id: `${kind}-${i + 1}`,
        kind,
        product,
        quantity: round1(baseQty * (0.3 + rand() * 1.2)),
        [kind === 'offer' ? 'price' : 'offer_price']: rand() > 0.08 ? price : null,
        address: person.address,
        phone: person.phone,
        notes:
          rand() > 0.45
            ? `${product} — sifatli, saralangan mahsulot. Yuklash va tarozi joyida.`
            : null,
        created_at: isoDaysAgo(round1(rand() * 40)),
        status: 'active',
        owner_id: person.id,
        [kind === 'offer' ? 'farmer_name' : 'buyer_name']: person.name,
        views_count: 20 + Math.floor(rand() * 900),
        // MOCK: premium e'lonlarda qisqa video (hozircha faqat belgi).
        has_video: person.is_premium && rand() > 0.5,
      })
    }
  }

  build('offer', farmers, 26, 0)
  build('request', resellers, 20, 2)
  return out
}

function seed() {
  const profiles = makeProfiles()
  return {
    version: VERSION,
    currentUserId: null,
    profiles,
    listings: makeListings(profiles),
    conversations: [],
    messages: [],
    follows: [], // { follower_id, following_id }
    transactions: [],
  }
}

/* ------------------------------ Saqlash ---------------------------------- */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== VERSION) return seed()
    return parsed
  } catch {
    return seed()
  }
}

const db = load()

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (err) {
    log.store.error('MOCK bazani saqlab bo\'lmadi', err)
  }
}

/** MOCK bazani boshlang'ich holatiga qaytaradi (sozlamalardagi "keshni tozalash"). */
export function resetDb() {
  Object.assign(db, seed())
  save()
}

export default db

/* ------------------------------ Yordamchilar ----------------------------- */

export function findProfile(id) {
  return db.profiles.find((p) => p.id === id) ?? null
}

export function currentProfile() {
  return db.currentUserId ? findProfile(db.currentUserId) : null
}

/** Karta va tafsilot sahifalari kutadigan ko'rinish: e'lon + egasining qisqa profili. */
export function decorate(listing) {
  const owner = findProfile(listing.owner_id)
  return {
    ...listing,
    owner: owner
      ? {
          id: owner.id,
          name: owner.name,
          avatar_url: owner.avatar_url,
          role: owner.role,
          rating: owner.rating,
          is_premium: owner.is_premium,
          is_verified_farmer: owner.is_verified_farmer,
        }
      : null,
  }
}

/** Ommaviy profil ko'rinishi (o'zi uchun `is_me: true`). */
export function publicProfile(profile) {
  if (!profile) return null
  const me = db.currentUserId
  const listings = db.listings.filter((l) => l.owner_id === profile.id)
  return {
    ...profile,
    is_me: profile.id === me,
    is_followed: Boolean(me && db.follows.some((f) => f.follower_id === me && f.following_id === profile.id)),
    followers_count: profile.followers_count + db.follows.filter((f) => f.following_id === profile.id).length,
    total_listings_count: listings.length,
    offers_count: listings.filter((l) => l.kind === 'offer').length,
    requests_count: listings.filter((l) => l.kind === 'request').length,
  }
}

/** Yangi foydalanuvchi (kirishda yaratiladi). */
export function createUser({ name, phone, email, provider }) {
  const profile = {
    id: uid('user'),
    name: name || 'Foydalanuvchi',
    role: 'dehqon',
    phone: phone || null,
    email: email || null,
    avatar_url: null,
    address: null,
    // MOCK: yangi hisob reytingi 5.0 dan boshlanadi (hali bitimi yo'q).
    rating: 5,
    rating_count: 0,
    deals_count: 0,
    bonus_points: 0,
    is_premium: false,
    is_verified_farmer: false,
    has_password: provider === 'phone',
    has_google: provider === 'google',
    has_apple: provider === 'apple',
    followers_count: 0,
    following_count: 0,
    created_at: nowIso(),
  }
  db.profiles.push(profile)
  save()
  return profile
}

/** Kirgan foydalanuvchi uchun bir nechta namuna suhbat (bo'sh chat qorong'i ko'rinmasin). */
export function ensureSeedConversations(userId) {
  if (db.conversations.some((c) => c.member_ids.includes(userId))) return
  const partners = [db.profiles[0], db.profiles[12], db.profiles[1]].filter(Boolean)
  const lines = [
    ['Assalomu alaykum! Mahsulotingiz hali bormi?', true],
    ['Narxda kelishsak bo\'ladi, tonnasi qancha?', false],
    ['Ertaga tarozida uchrashamiz.', true],
  ]

  partners.forEach((partner, i) => {
    const conv = {
      id: uid('conv'),
      member_ids: [userId, partner.id],
      created_at: isoDaysAgo(3 - i),
    }
    db.conversations.push(conv)
    const [text, fromPartner] = lines[i % lines.length]
    db.messages.push({
      id: uid('msg'),
      conversation_id: conv.id,
      sender_id: fromPartner ? partner.id : userId,
      content: text,
      is_read: i > 0,
      created_at: isoDaysAgo(3 - i),
    })
  })
  save()
}
