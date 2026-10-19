# AGROGRAM — soxta (mock) nuqtalar ro'yxati

Backend hali yozilmagan (u keyinchalik mikroservislar ko'rinishida quriladi),
shuning uchun frontend barcha ma'lumotni **bitta xizmat qatlami** orqali oladi:

```
src/services/index.js      ← ilovadagi YAGONA import nuqtasi
src/services/errors.js     ← xatoni foydalanuvchi tiliga o'girish
src/services/mock/         ← hozirgi (soxta) amalga oshirish
  db.js            brauzer xotirasidagi baza (localStorage: `agrogram_mock_db`)
  util.js          kechikish (delay), ID, urug'langan tasodif
  auth.js          Google / iCloud / telefon + parol
  listings.js      takliflar va so'rovlar
  profiles.js      profil, avatar, obuna
  chat.js          suhbatlar va xabarlar
  account.js       hosil kalkulyatori (super kalkulyator)
```

Har bir soxta funksiya `// MOCK:` izohi bilan belgilangan va qisqa kutishdan
keyin **muvaffaqiyat** qaytaradi — interfeysda avval spinner, keyin natija
ko'rinadi.

## Ulash tartibi

1. `src/services/real/` da shu ro'yxatdagi funksiyalarni HTTP orqali yozing
   (tayyor axios mijozi: `src/api.js`).
2. `src/services/index.js` dagi eksportlarni o'shanga yo'naltiring va
   `USE_MOCK` ni `false` qiling.
3. Sahifalar va komponentlarga tegilmaydi — ular faqat `src/services/index.js`
   dan import qiladi.

## Soxta nuqtalar

| Soxta nuqta | Fayl | Hozirgi xatti-harakat | Backendda nima kerak |
| --- | --- | --- | --- |
| Google bilan kirish | `mock/auth.js` · `signInWithGoogle` | ~1,1s kutish → soxta JWT va profil | OAuth qayta yo'naltirish + `/auth/google` |
| iCloud (Apple) bilan kirish | `mock/auth.js` · `signInWithApple` | ~1,1s kutish → soxta JWT va profil | OAuth qayta yo'naltirish + `/auth/apple` |
| Telefon + parol (kirish / ro'yxat) | `mock/auth.js` · `phoneLogin`, `phoneRegister` | parol tekshirilmaydi, SMS yo'q | parol xeshi, sessiya, rate-limit |
| Joriy profil | `mock/auth.js` · `getMe` | bazadan o'qiydi; sessiya yo'q bo'lsa 401 | `/auth/me` |
| Akkauntni ulash (Google/Apple) | `SettingsSubPage` · `linkOAuth` | profil maydonini belgilaydi | haqiqiy bog'lash so'rovi |
| E'lonlar (ro'yxat, tafsilot, CRUD) | `mock/listings.js` | 26 ta taklif + 20 ta so'rov namunasi, o'zgarishlar localStorage da. Doska faqat `status: 'active'` larni beradi; egasi o'z `owner_id` si bilan so'rasa — hammasi (yopilganlari ham), boshqalarning profilida — faqat faollari | `/offers`, `/requests` |
| E'lonni yopish / qayta ochish | `mock/listings.js` · `updateOffer/updateRequest(id, { status })` | `'active'` ⇄ `'closed'` | xuddi shu PUT yoki alohida endpoint |
| Faol e'lonlar kvotasi (10 / doska) | `mock/listings.js` · `assertQuota`, `countMyListings` | yaratishda va qayta faollashtirishda 10 ta faoldan oshsa — `409 { code: 'listing_limit', limit }` | aynan shu kvota (faqat faol, har doska alohida) |
| E'lon rasmlari | `mock/listings.js` · `uploadListingImages` | fayl yuborilmaydi, rasm faqat sessiyada (`src/listings/images.js`) | fayl saqlash xizmati |
| E'londagi qisqa video (hamma uchun) | `ListingFormPage`, `mock/listings.js` | faqat `has_video` belgisi, fayl yuklanmaydi | video yuklash va transkodlash |
| Profil, avatar, obuna | `mock/profiles.js` | avatar `blob:` havola sifatida, obuna bazada | `/profiles`, fayl saqlash |
| Suhbat va xabarlar | `mock/chat.js` | cheksiz xabar, ~2,2s dan keyin avtomatik javob | WebSocket / `/conversations` |
| O'qilmagan xabarlar soni | `mock/chat.js` · `getUnreadCount` | bazadan sanaladi | server hisobi |
| **Hosil bashorati (super kalkulyator)** | `mock/account.js` · `estimateYield` | gektariga o'rtacha hosil × maydon, urug' me'yoriga tuzatish; me'yorlar `src/data/products.js` dan. Maydon interfeysda ga / sotix / m² da kiritiladi, chaqiruvdan oldin GEKTARGA o'giriladi (`components/calc/units.js`), urug' esa kilogrammga | agro-model (tuproq, sug'orish, ob-havo) |
| Sozlamalar (bildirishnoma, maxfiylik) | `src/appSettings.jsx` | faqat shu qurilmada (localStorage) | profil sozlamalari |
| Kalkulyator tarixi | `components/calc/history.js` | oxirgi 25 ta hisob localStorage da (`agrogram_calc_history`, `agrogram_yield_history`), serverga yuborilmaydi | kerak bo'lsa — profilga bog'langan tarix |
| E'lon ko'rishlari, shikoyat | `ListingDetailPage` | ko'rishlar namunaviy, shikoyat faqat xabar | hisoblagich va shikoyat endpointi |

## Mahsulot turlari ro'yxati (mock EMAS)

`src/data/products.js` — mahsulot turlarining yagona ro'yxati (hozircha 44 ta
tur; shulardan agronomik me'yori borlari kalkulyatorda ekin sifatida chiqadi). Bu soxta
ma'lumot emas, balki **konfiguratsiya**: e'lon formasi (ikkala doska) va
kalkulyatordagi ekin tanlagichi shu ro'yxatdan oziqlanadi, shuning uchun
foydalanuvchi mavjud bo'lmagan mahsulot nomini yoza olmaydi.

Yangi tur qo'shish uchun faqat shu faylga bitta satr qo'shiladi:

```js
{ id: 'behi', uz: 'Behi', ru: 'Айва' }
// ixtiyoriy: kalkulyatorda ham chiqishi uchun
{ id: 'behi', uz: 'Behi', ru: 'Айва', crop: { yieldPerHa: 18, seedPerHa: 0 } }
```

E'londa kanonik o'zbekcha nom (`product`) va barqaror kalit (`product_id`)
saqlanadi; interfeys nomni foydalanuvchi tiliga o'giradi. Backend paydo
bo'lganda ro'yxat serverdan kelishi mumkin — u holda shu faylning o'rniga
katalog endpointi qo'yiladi, iste'molchilar (`ProductSelect`, kalkulyator)
o'zgarmaydi.

## E'lon chegarasi

`src/limits.js` — yagona manba: **har bir doskada 10 ta FAOL e'lon**
(`LISTING_LIMIT`). Backend kvotasi bilan aynan bir xil — faqat
`status === 'active'` e'lonlar sanaladi, takliflar va so'rovlar alohida.
Foydalanuvchi eski e'lonini yopsa (yoki o'chirsa), o'rniga yangisini
joylashtira oladi. Tariflar, Premium va rollar yo'q: ro'yxatdan o'tgan
har kim ikkala doskaga ham yoza oladi — e'lon turini doska belgilaydi.

Interfeys chegarani uch joyda tekshiradi: doskadagi "+" tugmasi, forma
sahifasi (`countMyListings`) va server javobi (`409 listing_limit` →
`errorMessage` tarjima qiladi).

## Namunaviy ma'lumotni tozalash

Brauzer konsolida:

```js
localStorage.removeItem('agrogram_mock_db')
```

yoki kodda: `resetMockData()` (`src/services/index.js`).
