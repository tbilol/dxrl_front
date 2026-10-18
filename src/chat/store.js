import { useSyncExternalStore } from 'react'

/**
 * Xabarlarning "qo'shimcha" ma'lumotlari — ovoz klipi, javob bog'lanishi va
 * reaksiyalar.
 *
 * TODO: Connect to backend — serverdagi `messages` jadvalida faqat `content`
 * (matn), `is_read` va `created_at` bor. Javob (`reply_to_id`), reaksiya va
 * ovoz fayli uchun ustunlar yo'q, shuning uchun bu ma'lumotlar hozircha
 * FAQAT joriy sessiyada, brauzer xotirasida saqlanadi va sahifa
 * yangilanganda yo'qoladi. Suhbatdosh ham ularni ko'rmaydi.
 *
 * Backend tayyor bo'lgach shu modul o'rniga API javobidagi maydonlar
 * ishlatiladi — komponentlar o'zgarishsiz qoladi.
 */

const state = {
  /** messageId → { url, durationMs, wave } */
  voice: new Map(),
  /** messageId → { id, preview, mine } */
  replies: new Map(),
  /** messageId → emoji */
  reactions: new Map(),
  /** messageId → [{ id, kind, url, name, size, duration }] */
  media: new Map(),
  /** messageId → 0..100 (yuklanayotgan bo'lsa) */
  progress: new Map(),
}

let version = 0
const listeners = new Set()

function emit() {
  version += 1
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Komponentlar shu hook orqali o'zgarishlarni kuzatadi. */
export function useChatExtras() {
  useSyncExternalStore(subscribe, () => version, () => version)
  return state
}

/* --------------------------------- Ovoz --------------------------------- */

export function attachVoice(messageId, clip) {
  state.voice.set(messageId, clip)
  emit()
}

export function getVoice(messageId) {
  return state.voice.get(messageId) ?? null
}

/** Xabar ID si serverdan kelgach vaqtinchalik ID ni almashtiramiz. */
export function moveVoice(fromId, toId) {
  const clip = state.voice.get(fromId)
  if (!clip) return
  state.voice.delete(fromId)
  state.voice.set(toId, clip)
  emit()
}

/* --------------------------------- Media --------------------------------- */

export function attachMedia(messageId, items) {
  state.media.set(messageId, items)
  emit()
}

export function getMedia(messageId) {
  return state.media.get(messageId) ?? null
}

export function setProgress(messageId, pct) {
  if (pct == null) state.progress.delete(messageId)
  else state.progress.set(messageId, pct)
  emit()
}

export function moveMedia(fromId, toId) {
  const items = state.media.get(fromId)
  if (items) {
    state.media.delete(fromId)
    state.media.set(toId, items)
  }
  const pct = state.progress.get(fromId)
  if (pct != null) {
    state.progress.delete(fromId)
    state.progress.set(toId, pct)
  }
  if (items || pct != null) emit()
}

/* -------------------------------- Javob ---------------------------------- */

export function attachReply(messageId, reply) {
  state.replies.set(messageId, reply)
  emit()
}

export function moveReply(fromId, toId) {
  const reply = state.replies.get(fromId)
  if (!reply) return
  state.replies.delete(fromId)
  state.replies.set(toId, reply)
  emit()
}

/* ------------------------------ Reaksiya --------------------------------- */

/** Bir xil emoji qayta bosilsa — olib tashlanadi. */
export function toggleReaction(messageId, emoji) {
  if (state.reactions.get(messageId) === emoji) state.reactions.delete(messageId)
  else state.reactions.set(messageId, emoji)
  emit()
}

export const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥']

/* ------------------------------ Tozalash --------------------------------- */

/** Ovoz havolalarini bo'shatadi (sahifadan chiqishda). */
export function releaseVoice() {
  state.voice.forEach((clip) => {
    if (clip?.url) URL.revokeObjectURL(clip.url)
  })
  state.media.forEach((items) => {
    items.forEach((it) => {
      if (it?.url?.startsWith('blob:')) URL.revokeObjectURL(it.url)
    })
  })
  state.voice.clear()
  state.media.clear()
  state.progress.clear()
  state.replies.clear()
  state.reactions.clear()
  emit()
}
