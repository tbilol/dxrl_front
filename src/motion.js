/* Butun ilova uchun yagona harakat "ritmi".
   UX qoidalari: 150–300ms mikro-animatsiya, kirish sekinroq / chiqish tezroq,
   ro'yxatlarda 30–50ms kechikish, faqat transform va opacity animatsiyalanadi. */

export const spring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 }
export const enter = { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
export const exit = { duration: 0.18, ease: [0.4, 0, 1, 1] }

/*
 * Sahifa variantlarida `exit` YO'Q — ataylab.
 * Chiqish animatsiyasi <AnimatePresence mode="wait"> bilan birga yangi
 * sahifaning mount bo'lishini kutdirardi: har bir o'tishda ~215ms qotib
 * turish va bo'sh ekran. Endi eski sahifa darhol olib tashlanadi, yangisi
 * esa faqat kirish animatsiyasi bilan (transform + opacity) paydo bo'ladi.
 */

/** Tab sahifalari — yumshoq ko'tarilib paydo bo'ladi (siljish + so'nish). */
export const fadePage = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: enter },
}

/** Ichki sahifalar (detal, chat) — o'ngdan suriladi. */
export const slidePage = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: enter },
}

/** Ko'p qadamli forma qadamlari — yo'nalishga qarab siljiydi. */
export const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: enter },
  leave: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: exit }),
}

/** Ro'yxat elementlari ketma-ket paydo bo'ladi. */
export const listContainer = {
  animate: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
}

/**
 * Uzun ro'yxatlar uchun: ketma-ketlik butun ro'yxat bo'ylab STAGGER_BUDGET
 * ichiga sig'diriladi. Qat'iy 45ms bilan 300 ta karta 13 soniya davomida
 * paydo bo'lardi — foydalanuvchi uchun bu shunchaki "sahifa qotib qoldi".
 */
const STAGGER_BUDGET = 0.35

export function listContainerFor(count) {
  if (!count || count <= 1) return listContainer
  const step = Math.min(0.045, STAGGER_BUDGET / count)
  return { animate: { transition: { staggerChildren: step, delayChildren: 0.02 } } }
}

export const listItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: enter },
}

/** Chat xabari — pastdan ko'tariladi. */
export const bubbleIn = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: spring },
}

/** Bosilganda kichrayish — barcha bosiladigan kartalar/tugmalar uchun. */
export const tap = { scale: 0.975 }
export const tapSmall = { scale: 0.94 }

/*
 * Karta ustida sichqoncha / barmoq.
 *
 * Bu ikkalasi CSS da emas, framer-motion orqali beriladi: karta `listItem`
 * varianti bilan chiqadi, ya'ni uning `transform` i motion tomonidan
 * boshqariladi (chiqish tugagach elementga `transform: none` yoziladi) —
 * CSS dagi :hover/:active transform i shu inline qiymat ostida ko'rinmay
 * qolardi.
 */
export const cardHover = { y: -2, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }
export const cardTap = { scale: 0.98, transition: { duration: 0.1 } }

/**
 * prefers-reduced-motion yoqilgan bo'lsa harakatni o'chiradi.
 * framer-motion'ning useReducedMotion() natijasini uzatasiz.
 */
export function maybe(variants, reduced) {
  if (!reduced) return variants
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.12 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  }
}
