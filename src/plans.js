/**
 * Tariflar — Default va Premium.
 *
 * Chegaralar interfeysda shu yerdan o'qiladi: e'lon qo'shish tugmasi,
 * profildagi "Premium" bo'limi va kalkulyator gatelari bir xil manbadan
 * foydalanadi. Backend kelganda qiymatlar serverdan olinadi, lekin
 * kalitlar o'zgarmaydi.
 */

export const PLANS = {
  default: {
    id: 'default',
    priceUsd: 0,
    nameKey: 'plan.default',
    limits: { offers: 5, requests: 5 },
    features: {
      stats: true,
      chat: true,
      badge: false,
      calculator: false,
      video: false,
    },
  },
  premium: {
    id: 'premium',
    priceUsd: 9.99,
    nameKey: 'plan.premium',
    limits: { offers: 20, requests: 25 },
    features: {
      stats: true,
      chat: true,
      badge: true,
      calculator: true,
      video: true,
    },
  },
}

export function planOf(user) {
  return user?.is_premium ? PLANS.premium : PLANS.default
}

/** `kind` — 'offer' yoki 'request'. */
export function limitFor(user, kind) {
  const plan = planOf(user)
  return kind === 'offer' ? plan.limits.offers : plan.limits.requests
}

/** Chegara tugaganmi? `used` — foydalanuvchining shu turdagi e'lonlari soni. */
export function reachedLimit(user, kind, used) {
  return used >= limitFor(user, kind)
}

export function hasFeature(user, feature) {
  return Boolean(planOf(user).features[feature])
}

/** Dehqon e'lon joylashtirishi uchun e-ijara tasdig'i shart. */
export function canPostOffer(user) {
  return Boolean(user?.is_verified_farmer)
}
