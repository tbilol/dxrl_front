/**
 * MOCK: suhbatlar va xabarlar.
 *
 * Xabarlar soni cheklanmagan — hammasi brauzerdagi bazada saqlanadi.
 * Suhbatdosh javobi ham soxta: yuborilgan xabardan keyin qisqa kutish bilan
 * tayyor javoblardan bittasi qo'shiladi, shunda oqim ikki tomonlama ko'rinadi.
 */

import db, { findProfile, save } from './db.js'
import { delay, nowIso, SHORT, uid } from './util.js'

/** MOCK: suhbatdoshning avtomatik javoblari. */
const AUTO_REPLIES = [
  'Xabaringiz uchun rahmat! Tez orada javob beraman.',
  'Yaxshi, kelishdik.',
  'Miqdor va narxni aniqlashtirib olaylik.',
  "Ertaga tarozida ko'rishamiz.",
  'Mahsulot tayyor, olib ketsangiz bo\'ladi.',
]
const AUTO_REPLY_MS = 2200

function messagesOf(conversationId) {
  return db.messages
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
}

function toListItem(conv) {
  const me = db.currentUserId
  const otherId = conv.member_ids.find((id) => id !== me) ?? conv.member_ids[0]
  const other = findProfile(otherId)
  const list = messagesOf(conv.id)
  const last = list[list.length - 1] ?? null

  return {
    id: conv.id,
    other_user: other
      ? {
          id: other.id,
          name: other.name,
          avatar_url: other.avatar_url,
          role: other.role,
          rating: other.rating,
          is_premium: other.is_premium,
        }
      : { id: otherId, name: '—', avatar_url: null },
    last_message: last?.content ?? null,
    last_message_at: last?.created_at ?? conv.created_at,
    last_message_sender_id: last?.sender_id ?? null,
    unread_count: list.filter((m) => m.sender_id !== me && !m.is_read).length,
  }
}

export function getConversations() {
  return delay(() => {
    const me = db.currentUserId
    return db.conversations
      .filter((c) => c.member_ids.includes(me))
      .map(toListItem)
      .sort((a, b) => String(b.last_message_at).localeCompare(String(a.last_message_at)))
  }, SHORT)
}

/** Suhbat bo'lsa o'shani, bo'lmasa yangisini qaytaradi. */
export function openConversation(otherUserId) {
  return delay(() => {
    const me = db.currentUserId
    const existing = db.conversations.find(
      (c) => c.member_ids.includes(me) && c.member_ids.includes(otherUserId),
    )
    if (existing) return toListItem(existing)

    const conv = { id: uid('conv'), member_ids: [me, otherUserId], created_at: nowIso() }
    db.conversations.push(conv)
    save()
    return toListItem(conv)
  }, SHORT)
}

export function getMessages(conversationId) {
  return delay(() => {
    const me = db.currentUserId
    // Ochilganda suhbatdoshning xabarlari o'qilgan deb belgilanadi.
    messagesOf(conversationId).forEach((m) => {
      if (m.sender_id !== me) m.is_read = true
    })
    save()
    return messagesOf(conversationId)
  }, SHORT)
}

export function sendMessage(conversationId, content) {
  return delay(() => {
    const me = db.currentUserId
    const message = {
      id: uid('msg'),
      conversation_id: conversationId,
      sender_id: me,
      content,
      is_read: false,
      created_at: nowIso(),
    }
    db.messages.push(message)
    save()

    // MOCK: suhbatdoshdan avtomatik javob (backendda bu haqiqiy foydalanuvchi bo'ladi).
    const conv = db.conversations.find((c) => c.id === conversationId)
    const otherId = conv?.member_ids.find((id) => id !== me)
    if (otherId) {
      const reply = AUTO_REPLIES[db.messages.length % AUTO_REPLIES.length]
      setTimeout(() => {
        db.messages.push({
          id: uid('msg'),
          conversation_id: conversationId,
          sender_id: otherId,
          content: reply,
          is_read: false,
          created_at: nowIso(),
        })
        save()
      }, AUTO_REPLY_MS)
    }

    return message
  }, SHORT)
}

export function getUnreadCount() {
  return delay(() => {
    const me = db.currentUserId
    if (!me) return 0
    const mine = new Set(db.conversations.filter((c) => c.member_ids.includes(me)).map((c) => c.id))
    return db.messages.filter((m) => mine.has(m.conversation_id) && m.sender_id !== me && !m.is_read).length
  }, 120)
}
