/**
 * Suhbatdoshning holati — "Onlayn" yoki "Oxirgi marta 14:30".
 *
 * MUHIM: serverda `last_seen_at` / `is_online` maydonlari yo'q. Shuning uchun
 * holat MAVJUD ma'lumotdan chiqariladi — suhbatdoshning oxirgi xabari vaqti.
 * Bu taxmin, lekin yolg'on emas: agar odam bir necha daqiqa oldin yozgan
 * bo'lsa, u haqiqatan ham shu yaqinda faol bo'lgan.
 *
 * TODO: Connect to presence backend — server `last_seen_at` yuborishni
 * boshlagach, quyidagi `derivePresence()` o'sha maydonni o'qiydi.
 */

import { parseDate } from '../utils.js'

/** Shu vaqt ichida yozgan bo'lsa — "onlayn" deb ko'rsatamiz. */
const ONLINE_WINDOW_MS = 3 * 60 * 1000

/**
 * @param {Array} messages  suhbatdagi xabarlar
 * @param {string} peerId   suhbatdoshning id si
 */
export function derivePresence(messages, peerId) {
  if (!peerId || !messages?.length) return { online: false, lastSeen: null }

  let last = null
  for (const msg of messages) {
    if (msg.sender_id !== peerId) continue
    const at = parseDate(msg.created_at)
    if (at && (!last || at > last)) last = at
  }

  if (!last) return { online: false, lastSeen: null }
  return { online: Date.now() - last.getTime() < ONLINE_WINDOW_MS, lastSeen: last }
}

/**
 * Suhbatlar ro'yxati uchun: oxirgi xabarni SUHBATDOSH yozgan bo'lsa va u
 * yaqinda bo'lsa — "onlayn" deb ko'rsatamiz.
 */
export function isRecentlyActive(lastMessageAt, lastSenderId, peerId) {
  if (!lastMessageAt || !peerId || lastSenderId !== peerId) return false
  const at = parseDate(lastMessageAt)
  return Boolean(at && Date.now() - at.getTime() < ONLINE_WINDOW_MS)
}
