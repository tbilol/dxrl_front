/* Butun ilova uchun yagona harakat "ritmi".
   UX qoidalari: 150–300ms mikro-animatsiya, kirish sekinroq / chiqish tezroq,
   ro'yxatlarda 30–50ms kechikish, faqat transform va opacity animatsiyalanadi. */

export const spring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 }
export const enter = { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
export const exit = { duration: 0.16, ease: [0.4, 0, 1, 1] }

/** Tab sahifalari — yumshoq ko'tarilib paydo bo'ladi. */
export const fadePage = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: enter },
  exit: { opacity: 0, y: -6, transition: exit },
}

/** Ichki sahifalar (detal, chat) — o'ngdan suriladi. */
export const slidePage = {
  initial: { opacity: 0, x: 26 },
  animate: { opacity: 1, x: 0, transition: enter },
  exit: { opacity: 0, x: -18, transition: exit },
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
