/**
 * Kalkulyator birliklari va o'girishlar.
 *
 * Maydon ICHKARIDA har doim gektarda, urug' esa kilogrammda hisoblanadi —
 * foydalanuvchi qaysi birlikni tanlashidan qat'i nazar natija bir xil
 * bo'ladi (1 ga = 100 sotix = 10 000 m²; 1 tonna = 1000 kg).
 */

export const AREA_UNITS = [
  { id: 'ga', labelKey: 'units.ha', toHa: (n) => n },
  { id: 'sotix', labelKey: 'units.sotix', toHa: (n) => n / 100 },
  { id: 'm2', labelKey: 'units.m2', toHa: (n) => n / 10000 },
]

export const SEED_UNITS = [
  { id: 'kg', labelKey: 'units.kg', toKg: (n) => n },
  { id: 'ton', labelKey: 'units.ton', toKg: (n) => n * 1000 },
]

/** Noma'lum (masalan, eski tarixdagi) birlik — ro'yxatdagi birinchisi. */
export function unitOf(list, id) {
  return list.find((u) => u.id === id) ?? list[0]
}

export const toHectares = (value, unitId) => unitOf(AREA_UNITS, unitId).toHa(Number(value) || 0)
export const toKilograms = (value, unitId) => unitOf(SEED_UNITS, unitId).toKg(Number(value) || 0)
