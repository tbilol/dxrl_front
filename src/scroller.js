/**
 * Ilovaning siljish konteyneri.
 *
 * Sahifa `document` emas, `.shell-main` ichida siljiydi. Sababi: mobil
 * brauzerda hujjat balandligi o'zgarganda (masalan uzun ro'yxatdan qisqa
 * sahifaga o'tganda) manzil paneli yig'ilib-yozilib, ko'rinadigan oyna
 * balandligini o'zgartiradi — shunda `position: fixed` pastki menyu
 * siljib ketadi. Hujjat umuman siljimasa, bu hech qachon sodir bo'lmaydi.
 *
 * Shu sababli `window.scrollY` / `window.scrollTo` o'rniga shu yordamchilar
 * ishlatiladi.
 */

export const SCROLLER_ID = 'app-scroll'

export function getScroller() {
  return document.getElementById(SCROLLER_ID)
}

/** Joriy siljish (px). */
export function scrollTop() {
  return getScroller()?.scrollTop ?? 0
}

export function scrollToTop() {
  const el = getScroller()
  if (el) el.scrollTop = 0
  else window.scrollTo(0, 0)
}

/** Siljish hodisasiga obuna bo'lish. Tozalash funksiyasini qaytaradi. */
export function onScroll(handler, options = { passive: true }) {
  const el = getScroller()
  const target = el ?? window
  target.addEventListener('scroll', handler, options)
  return () => target.removeEventListener('scroll', handler, options)
}
