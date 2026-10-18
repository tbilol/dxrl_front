/**
 * MOCK: profillar va obuna (kuzatish).
 */

import db, { currentProfile, findProfile, publicProfile, save } from './db.js'
import { delay, NORMAL, SHORT } from './util.js'

export const getProfiles = () => delay(() => db.profiles.map(publicProfile), SHORT)

export const getProfile = (id) =>
  delay(() => {
    const found = findProfile(id)
    if (!found) {
      const err = new Error('Profil topilmadi')
      err.response = { status: 404, data: { detail: 'Profil topilmadi' } }
      throw err
    }
    return publicProfile(found)
  }, SHORT)

// MOCK: profilni yangilash (ism, telefon, manzil, rol).
export const updateProfile = (id, data) =>
  delay(() => {
    const found = findProfile(id)
    Object.assign(found, data)
    save()
    return publicProfile(found)
  }, NORMAL)

export const createProfile = (data) => delay(() => publicProfile({ ...currentProfile(), ...data }), NORMAL)

// MOCK: hisobni o'chirish.
export const deleteProfile = (id) =>
  delay(() => {
    const i = db.profiles.findIndex((p) => p.id === id)
    if (i >= 0) db.profiles.splice(i, 1)
    db.listings = db.listings.filter((l) => l.owner_id !== id)
    db.currentUserId = null
    save()
    return { ok: true }
  }, NORMAL)

/**
 * MOCK: profil rasmini yuklash. Fayl brauzerda `blob:` havola sifatida
 * saqlanadi — sahifa yangilanguncha ko'rinadi.
 */
export const uploadAvatar = (id, file) =>
  delay(() => {
    const found = findProfile(id)
    found.avatar_url = file ? URL.createObjectURL(file) : found.avatar_url
    save()
    return publicProfile(found)
  }, NORMAL)

/* --------------------------------- Obuna --------------------------------- */

export const followProfile = (id) =>
  delay(() => {
    const me = db.currentUserId
    if (me && !db.follows.some((f) => f.follower_id === me && f.following_id === id)) {
      db.follows.push({ follower_id: me, following_id: id })
      save()
    }
    const profile = publicProfile(findProfile(id))
    return { is_followed: true, followers_count: profile.followers_count }
  }, SHORT)

export const unfollowProfile = (id) =>
  delay(() => {
    const me = db.currentUserId
    db.follows = db.follows.filter((f) => !(f.follower_id === me && f.following_id === id))
    save()
    const profile = publicProfile(findProfile(id))
    return { is_followed: false, followers_count: profile.followers_count }
  }, SHORT)

// MOCK: kuzatuvchilar — namuna ro'yxat + haqiqiy obunalar.
export const getFollowers = (id) =>
  delay(() => {
    const real = db.follows.filter((f) => f.following_id === id).map((f) => publicProfile(findProfile(f.follower_id)))
    const sample = db.profiles.filter((p) => p.id !== id).slice(0, 6).map(publicProfile)
    return [...real.filter(Boolean), ...sample]
  }, SHORT)

export const getFollowing = (id) =>
  delay(() => {
    const real = db.follows.filter((f) => f.follower_id === id).map((f) => publicProfile(findProfile(f.following_id)))
    return real.filter(Boolean)
  }, SHORT)
