/**
 * MAHSULOT TURLARI — yagona ro'yxat.
 *
 * E'lon formasi (ikkala doska) va kalkulyatordagi ekin tanlagichi AYNAN shu
 * ro'yxatdan oziqlanadi. Foydalanuvchi mahsulot nomini qo'lda yozmaydi —
 * faqat shu yerdagi turlardan birini tanlaydi, shuning uchun bazaga
 * "asdf" kabi mavjud bo'lmagan nomlar tushmaydi.
 *
 * YANGI MAHSULOT QO'SHISH: quyidagi massivga bitta satr qo'shing —
 *
 *   { id: 'behi', uz: 'Behi', ru: 'Айва' }
 *
 * `id` — barqaror kalit (o'zgartirilmaydi: e'lonlarda saqlanadi).
 * `uz` — bazaga yoziladigan kanonik nom (mahsulot ranglari shu nom bo'yicha,
 *        data/productColors.js ga qarang).
 * `ru` — interfeysdagi ruscha yorliq.
 * `crop` — ixtiyoriy: hosil kalkulyatori uchun agronomik me'yorlar
 *        (gektariga o'rtacha hosil, tonna; gektariga urug'/ko'chat, kg).
 *        Faqat `crop` bor mahsulotlar kalkulyatorda ekin sifatida chiqadi —
 *        ko'p yillik daraxt/tok ekinlari (olma, uzum) urug' me'yoriga
 *        bog'lanmagani uchun u yerda ko'rsatilmaydi.
 */

export const PRODUCTS = [
  /* ----------------------------- Don va texnika ---------------------------- */
  { id: 'bugdoy', uz: "Bug'doy", ru: 'Пшеница', crop: { yieldPerHa: 5.2, seedPerHa: 220 } },
  { id: 'arpa', uz: 'Arpa', ru: 'Ячмень', crop: { yieldPerHa: 4.2, seedPerHa: 200 } },
  { id: 'sholi', uz: 'Sholi', ru: 'Рис', crop: { yieldPerHa: 6, seedPerHa: 180 } },
  { id: 'makkajoxori', uz: "Makkajo'xori", ru: 'Кукуруза', crop: { yieldPerHa: 8.5, seedPerHa: 25 } },
  { id: 'paxta', uz: 'Paxta', ru: 'Хлопок', crop: { yieldPerHa: 3.4, seedPerHa: 60 } },
  { id: 'kungaboqar', uz: 'Kungaboqar', ru: 'Подсолнечник', crop: { yieldPerHa: 2.4, seedPerHa: 8 } },
  { id: 'kunjut', uz: 'Kunjut', ru: 'Кунжут', crop: { yieldPerHa: 1.2, seedPerHa: 5 } },
  { id: 'beda', uz: 'Beda', ru: 'Люцерна', crop: { yieldPerHa: 12, seedPerHa: 20 } },

  /* ------------------------------- Sabzavot -------------------------------- */
  { id: 'kartoshka', uz: 'Kartoshka', ru: 'Картофель', crop: { yieldPerHa: 24, seedPerHa: 2800 } },
  { id: 'sabzi', uz: 'Sabzi', ru: 'Морковь', crop: { yieldPerHa: 30, seedPerHa: 5 } },
  { id: 'piyoz', uz: 'Piyoz', ru: 'Лук', crop: { yieldPerHa: 32, seedPerHa: 6 } },
  { id: 'sarimsoq', uz: 'Sarimsoq', ru: 'Чеснок', crop: { yieldPerHa: 12, seedPerHa: 800 } },
  { id: 'pomidor', uz: 'Pomidor', ru: 'Помидор', crop: { yieldPerHa: 45, seedPerHa: 0.4 } },
  { id: 'bodring', uz: 'Bodring', ru: 'Огурец', crop: { yieldPerHa: 38, seedPerHa: 3 } },
  { id: 'karam', uz: 'Karam', ru: 'Капуста', crop: { yieldPerHa: 40, seedPerHa: 0.35 } },
  { id: 'qalampir', uz: "Bulg'or qalampiri", ru: 'Сладкий перец', crop: { yieldPerHa: 28, seedPerHa: 0.3 } },
  { id: 'achchiq-qalampir', uz: 'Achchiq qalampir', ru: 'Острый перец', crop: { yieldPerHa: 18, seedPerHa: 0.4 } },
  { id: 'baqlajon', uz: 'Baqlajon', ru: 'Баклажан', crop: { yieldPerHa: 35, seedPerHa: 0.3 } },
  { id: 'qovoq', uz: 'Qovoq', ru: 'Тыква', crop: { yieldPerHa: 30, seedPerHa: 2.5 } },
  { id: 'turp', uz: 'Turp', ru: 'Редька', crop: { yieldPerHa: 28, seedPerHa: 8 } },
  { id: 'lavlagi', uz: 'Lavlagi', ru: 'Свёкла', crop: { yieldPerHa: 35, seedPerHa: 10 } },

  /* ------------------------------- Dukkakli -------------------------------- */
  { id: 'mosh', uz: 'Mosh', ru: 'Маш', crop: { yieldPerHa: 1.6, seedPerHa: 25 } },
  { id: 'noxat', uz: "No'xat", ru: 'Нут', crop: { yieldPerHa: 2.2, seedPerHa: 90 } },
  { id: 'loviya', uz: 'Loviya', ru: 'Фасоль', crop: { yieldPerHa: 2.5, seedPerHa: 90 } },

  /* -------------------------------- Poliz ---------------------------------- */
  { id: 'qovun', uz: 'Qovun', ru: 'Дыня', crop: { yieldPerHa: 25, seedPerHa: 2 } },
  { id: 'tarvuz', uz: 'Tarvuz', ru: 'Арбуз', crop: { yieldPerHa: 35, seedPerHa: 3 } },

  /*
   * --------------------------------- Meva ---------------------------------
   * Ko'p yillik ekinlar: hosil urug' me'yoriga bog'lanmaydi (ko'chat ekiladi),
   * shuning uchun ularda `crop` yo'q — kalkulyatorda ham ko'rsatilmaydi.
   */
  { id: 'uzum', uz: 'Uzum', ru: 'Виноград' },
  { id: 'olma', uz: 'Olma', ru: 'Яблоко' },
  { id: 'nok', uz: 'Nok', ru: 'Груша' },
  { id: 'behi', uz: 'Behi', ru: 'Айва' },
  { id: 'shaftoli', uz: 'Shaftoli', ru: 'Персик' },
  { id: 'orik', uz: "O'rik", ru: 'Абрикос' },
  { id: 'gilos', uz: 'Gilos', ru: 'Черешня' },
  { id: 'olcha', uz: 'Olcha', ru: 'Вишня' },
  { id: 'olxori', uz: "Olxo'ri", ru: 'Слива' },
  { id: 'anor', uz: 'Anor', ru: 'Гранат' },
  { id: 'xurmo', uz: 'Xurmo', ru: 'Хурма' },
  { id: 'anjir', uz: 'Anjir', ru: 'Инжир' },
  { id: 'tut', uz: 'Tut', ru: 'Шелковица' },
  { id: 'limon', uz: 'Limon', ru: 'Лимон' },
  { id: 'qulupnay', uz: 'Qulupnay', ru: 'Клубника' },

  /* ------------------------------- Yong'oq --------------------------------- */
  { id: 'yongoq', uz: "Yong'oq", ru: 'Грецкий орех' },
  { id: 'bodom', uz: 'Bodom', ru: 'Миндаль' },
  { id: 'pista', uz: 'Pista', ru: 'Фисташка' },
]

/** Kalkulyatordagi ekinlar — agronomik me'yori bor mahsulotlar. */
export const CROPS = PRODUCTS.filter((p) => p.crop)

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]))

/** Nom (uz yoki ru) bo'yicha qidirish uchun kalit. */
const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .trim()

const BY_NAME = new Map()
for (const product of PRODUCTS) {
  BY_NAME.set(normalize(product.uz), product)
  BY_NAME.set(normalize(product.ru), product)
  BY_NAME.set(normalize(product.id), product)
}

export function findProduct(id) {
  return BY_ID.get(id) ?? null
}

/** E'londagi nomdan (yoki id dan) mahsulotni topadi — tahrirlash uchun. */
export function findProductByName(name) {
  return BY_NAME.get(normalize(name)) ?? null
}

/** Tanlangan tildagi yorliq. */
export function productLabel(product, lang) {
  if (!product) return ''
  return lang === 'ru' ? product.ru : product.uz
}

/**
 * E'londa saqlangan nomni foydalanuvchi tiliga o'giradi.
 * Ro'yxatda yo'q nom (eski e'lon) — o'zgarishsiz qaytariladi.
 */
export function localizeProduct(name, lang) {
  const product = findProductByName(name)
  return product ? productLabel(product, lang) : String(name ?? '')
}

/** Ro'yxatni qidiruv so'zi bo'yicha filtrlaydi (ikkala tilda ham qidiradi). */
export function searchProducts(query, list = PRODUCTS) {
  const q = normalize(query)
  if (!q) return list
  return list.filter(
    (p) => normalize(p.uz).includes(q) || normalize(p.ru).includes(q),
  )
}

export default PRODUCTS
