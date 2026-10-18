/**
 * E'lon chegarasi — har bir doskada 10 ta FAOL e'lon.
 *
 * Backenddagi kvota bilan aynan bir xil: faqat `status === 'active'`
 * e'lonlar sanaladi, takliflar va so'rovlar alohida. Foydalanuvchi eski
 * e'lonini yopsa, o'rniga yangisini joylashtira oladi.
 */

export const LISTING_LIMIT = 10

/** Foydalanuvchining shu doskadagi faol e'lonlari soni. */
export function countActive(items, userId) {
  if (!items || userId == null) return 0
  return items.filter((it) => it.owner_id === userId && it.status === 'active').length
}

/** Chegara tugaganmi? `used` — shu doskadagi faol e'lonlar soni. */
export function reachedLimit(used) {
  return used >= LISTING_LIMIT
}
