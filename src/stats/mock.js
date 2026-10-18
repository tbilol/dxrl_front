/**
 * Namuna ma'lumotlar — statistika paneli uchun.
 *
 * TODO: Replace with real API calls — backend hozircha filtrlangan
 * statistika (davr / hudud / reyting) so'rovlarini qo'llab-quvvatlamaydi:
 * /api/stats faqat umumiy top-10 va sanoqni qaytaradi. Backendda shunday
 * endpointlar paydo bo'lgach, bu fayl butunlay olib tashlanadi.
 *
 * Bu ro'yxat faqat haqiqiy e'lonlar bo'lmaganda ishlatiladi (bo'sh baza yoki
 * backend o'chiq) — real ma'lumot kelsa, u har doim ustun turadi.
 */

/** Bir xil natija berish uchun urug'langan tasodifiy sonlar (mulberry32). */
function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Mahsulot: [nom, o'rtacha narx so'm/kg, o'rtacha hajm tonna, mavsumiy o'sish]
   Narxlar 2 000 – 15 000 so'm/kg oralig'ida, ya'ni 2–15 mln so'm/tonna.
   Ro'yxatga rang jadvalidagi (stats/products.js) barcha mahsulotlar kiradi. */
const PRODUCTS = [
  ["Bug'doy", 4500, 60, 0.18],
  ['Paxta', 12500, 44, 0.1],
  ['Pomidor', 9000, 26, 0.32],
  ['Kartoshka', 6000, 50, 0.14],
  ['Piyoz', 4200, 56, 0.22],
  ['Sabzi', 5000, 34, 0.16],
  ['Olma', 11000, 28, 0.12],
  ['Uzum', 14500, 20, 0.2],
  ['Sholi', 9500, 38, 0.15],
  ['Mosh', 13500, 14, 0.1],
  ['Lavlagi', 3900, 30, 0.18],
  ['Bodring', 10000, 17, 0.35],
  ['Qovun', 5200, 47, 0.26],
  ['Tarvuz', 3000, 70, 0.3],
  ['Karam', 3500, 42, 0.24],
  ["O'rik", 13000, 12, 0.28],
  ['Anor', 12000, 17, 0.14],
  ["No'xat", 11000, 14, 0.09],
  ["Makkajo'xori", 3800, 52, 0.13],
  ['Arpa', 3600, 58, 0.12],
  ['Kunjut', 14000, 9, 0.08],
  ['Shaftoli', 10500, 15, 0.22],
  ['Qalampir', 12000, 11, 0.2],
  ['Sarimsoq', 13000, 8, 0.16],
]

/* Viloyat → tumanlar (utils.js dagi REGIONS nomlari bilan bir xil yoziladi). */
const PLACES = [
  ['Samarqand', ['Urgut tumani', 'Payariq tumani', 'Ishtixon tumani', 'Bulung\'ur tumani']],
  ['Andijon', ['Asaka tumani', 'Shahrixon tumani', 'Baliqchi tumani']],
  ["Farg'ona", ['Quva tumani', "Rishton tumani", "Marg'ilon shahri"]],
  ['Namangan', ['Chust tumani', 'Pop tumani', 'Uychi tumani']],
  ['Buxoro', ['G\'ijduvon tumani', 'Kogon tumani', 'Vobkent tumani']],
  ['Qashqadaryo', ['Shahrisabz tumani', 'Kitob tumani', 'Koson tumani']],
  ['Surxondaryo', ['Denov tumani', 'Sherobod tumani', 'Boysun tumani']],
  ['Xorazm', ['Urganch tumani', 'Xiva tumani', 'Gurlan tumani']],
  ['Toshkent viloyati', ['Chinoz tumani', 'Parkent tumani', 'Zangiota tumani']],
  ['Jizzax', ['Zomin tumani', "G'allaorol tumani"]],
  ['Navoiy', ['Karmana tumani', 'Xatirchi tumani']],
  ["Qoraqalpog'iston", ['Nukus tumani', "To'rtko'l tumani"]],
]

/*
 * Ism havzalari. Nomlar shu ro'yxatlardan juftlab yig'iladi — shunda namuna
 * ma'lumotda yuzlab turli dehqon va xaridor bo'ladi va "Batafsil" tugmasi
 * ochadigan to'liq reyting (200 tagacha) haqiqatan to'lib turadi.
 */
const FIRST_NAMES = [
  'Anvar', 'Bekzod', 'Dilshod', 'Farrux', "Gulnora", 'Hasan', 'Ibrohim', 'Jasur',
  'Kamola', 'Lutfulla', 'Mirzo', 'Nodira', 'Otabek', "Po'lat", 'Rustam', 'Sardor',
  'Shuhrat', 'Tohir', "Ulug'bek", 'Zafar', 'Aziza', 'Bahodir', 'Doniyor', 'Elyor',
]

const LAST_NAMES = [
  'Qodirov', 'Tursunov', 'Ergashev', 'Sattorov', "Yo'ldoshev", 'Rahimov',
  'Nazarov', 'Olimov', 'Sharipov', 'Ashurov', 'Ismoilov', 'Karimov',
  'Yusupov', 'Xolmatov',
]

/* Xaridorlar — asosan tashkilotlar. */
const FIRM_WORDS = [
  'Agro', 'Bahor', 'Dilnoza', 'Eco Fruit', 'Farmer', 'Global Agro', 'Humo',
  'Iqbol', 'Jahon', 'Kamron', 'Lazzat', 'Meva', 'Nur', 'Orzu', 'Poytaxt',
  'Qudrat', 'Registon', 'Samo', 'Toshkent', 'Umid',
]

const FIRM_SUFFIX = [
  'Savdo', 'Trade MChJ', 'Export', 'Logistics', 'Group', 'Market',
  'Distribution', 'Foods', 'Invest', 'Servis',
]

/**
 * `count` ta takrorlanmas nom: juftliklar aylantirib olinadi, shuning uchun
 * natija har doim bir xil (tasodif yo'q) va nomlar takrorlanmaydi.
 */
function nameList(count, firsts, lasts) {
  const out = []
  for (let i = 0; i < count; i += 1) {
    const first = firsts[i % firsts.length]
    const last = lasts[Math.floor(i / firsts.length) % lasts.length]
    out.push(`${first} ${last}`)
  }
  return out
}

const FARMERS = nameList(240, FIRST_NAMES, LAST_NAMES)
const BUYERS = nameList(200, FIRM_WORDS, FIRM_SUFFIX)

function makePeople(names, role, rand) {
  return names.map((name, i) => {
    const [region, districts] = PLACES[Math.floor(rand() * PLACES.length)]
    return {
      id: `${role}-${i + 1}`,
      name,
      role,
      avatar_url: null,
      region,
      districts,
    }
  })
}

/**
 * `count` ta e'lon yaratadi. Sanalar oxirgi 12 oyga taqsimlanadi, narxlar
 * mavsumiy o'sish + tasodifiy tebranish bilan — shunda dinamika grafigi
 * haqiqiy ko'rinadi.
 */
function makeListings({ kind, count, people, seed, now }) {
  const rand = rng(seed)
  const out = []
  const yearMs = 365 * 86400000

  for (let i = 0; i < count; i += 1) {
    const [product, basePrice, baseQty, drift] = PRODUCTS[Math.floor(rand() * PRODUCTS.length)]
    const person = people[Math.floor(rand() * people.length)]

    // Sanalar: yaqin kunlarga zichroq (rand^2) — bugungi/haftalik kesim ham to'ladi.
    const ageMs = Math.pow(rand(), 2.1) * yearMs
    const created = new Date(now.getTime() - ageMs)
    const yearsAgo = ageMs / yearMs

    // Narx: eski e'lonlar arzonroq (drift) + ±18% tebranish.
    const trend = 1 - drift * yearsAgo
    const noise = 0.82 + rand() * 0.36
    const price = Math.round((basePrice * trend * noise) / 50) * 50

    const quantity = Math.round(baseQty * (0.35 + rand() * 1.5) * 10) / 10
    const priceField = kind === 'offer' ? 'price' : 'offer_price'

    // Tuman e'londan e'longa o'zgaradi (viloyat esa o'sha-o'sha) — shunda
    // kaskadli hudud filtri namuna ma'lumotda ham ma'noli ishlaydi.
    const district = person.districts[Math.floor(rand() * person.districts.length)]

    out.push({
      id: `${kind}-mock-${i + 1}`,
      product,
      quantity,
      [priceField]: rand() > 0.07 ? price : null, // ba'zilari — kelishilgan narx
      address: `${person.region}, ${district}`,
      phone: '+998 90 000 00 00',
      created_at: created.toISOString().replace('Z', ''),
      status: 'active',
      owner_id: person.id,
      owner: { id: person.id, name: person.name, avatar_url: null, role: person.role },
      [kind === 'offer' ? 'farmer_name' : 'buyer_name']: person.name,
    })
  }
  return out
}

/**
 * Namuna takliflar va so'rovlar (har chaqiruvda bir xil).
 *
 * Hajm ataylab katta: diagrammalar qisqa davrlarda ham (masalan "Shu oy")
 * to'la ko'rinishi kerak — aks holda narx dinamikasi chizig'i uzuq-yuluq
 * bo'lib qolardi, "Batafsil" ochadigan uzun reyting esa bo'sh turardi.
 */
export function mockDataset(now = new Date()) {
  const farmers = makePeople(FARMERS, 'dehqon', rng(11))
  const buyers = makePeople(BUYERS, 'sotib_oluvchi', rng(29))
  return {
    offers: makeListings({ kind: 'offer', count: 2200, people: farmers, seed: 1337, now }),
    requests: makeListings({ kind: 'request', count: 1600, people: buyers, seed: 4242, now }),
  }
}
