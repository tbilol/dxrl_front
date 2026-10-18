/**
 * XIZMAT QATLAMI — ilovaning ma'lumot bilan yagona aloqa nuqtasi.
 *
 * Sahifalar va komponentlar HECH QACHON to'g'ridan-to'g'ri HTTP bilan
 * ishlamaydi: hamma narsa shu modul orqali o'tadi. Hozircha barcha
 * funksiyalar `./mock/` ichidagi soxta amalga oshirishga ulangan —
 * backend hali yozilmagan (u keyinchalik mikroservislar ko'rinishida
 * quriladi).
 *
 * ULANISH TARTIBI (backend tayyor bo'lganda):
 *   1. `./real/` papkasida shu ro'yxatdagi funksiyalarni HTTP orqali
 *      amalga oshiring (`src/api.js` dagi axios mijozi shunga tayyor).
 *   2. Quyidagi `impl` ni o'shanga almashtiring (yoki USE_MOCK ni false qiling).
 *   3. Sahifalarga tegilmaydi — ular faqat shu fayldan import qiladi.
 *
 * Soxta nuqtalar ro'yxati: `front/MOCKS.md`.
 */

import * as mockAccount from './mock/account.js'
import * as mockAuth from './mock/auth.js'
import * as mockChat from './mock/chat.js'
import * as mockListings from './mock/listings.js'
import * as mockProfiles from './mock/profiles.js'
import * as mockTransactions from './mock/transactions.js'
import { resetDb } from './mock/db.js'

/** Backend paydo bo'lgach — `false`. */
export const USE_MOCK = true

export { errorMessage } from './errors.js'
export { STEPS, STEP_KEYS } from './mock/transactions.js'

/* ---------------------------- Autentifikatsiya --------------------------- */

export const signInWithGoogle = mockAuth.signInWithGoogle
export const signInWithApple = mockAuth.signInWithApple
export const phoneLogin = mockAuth.phoneLogin
export const phoneRegister = mockAuth.phoneRegister
export const getMe = mockAuth.getMe
export const linkPhonePassword = mockAuth.linkPhonePassword
export const unlinkPhonePassword = mockAuth.unlinkPhonePassword
export const endSession = mockAuth.endSession

/* -------------------------------- E'lonlar ------------------------------- */

export const getOffers = mockListings.getOffers
export const getOffer = mockListings.getOffer
export const createOffer = mockListings.createOffer
export const updateOffer = mockListings.updateOffer
export const deleteOffer = mockListings.deleteOffer

export const getRequests = mockListings.getRequests
export const getRequest = mockListings.getRequest
export const createRequest = mockListings.createRequest
export const updateRequest = mockListings.updateRequest
export const deleteRequest = mockListings.deleteRequest

export const uploadListingImages = mockListings.uploadListingImages
export const countMyListings = mockListings.countMyListings

/* -------------------------------- Profil --------------------------------- */

export const getProfiles = mockProfiles.getProfiles
export const getProfile = mockProfiles.getProfile
export const createProfile = mockProfiles.createProfile
export const updateProfile = mockProfiles.updateProfile
export const deleteProfile = mockProfiles.deleteProfile
export const uploadAvatar = mockProfiles.uploadAvatar

export const followProfile = mockProfiles.followProfile
export const unfollowProfile = mockProfiles.unfollowProfile
export const getFollowers = mockProfiles.getFollowers
export const getFollowing = mockProfiles.getFollowing

/* ------------------------------- Xabarlar -------------------------------- */

export const getConversations = mockChat.getConversations
export const openConversation = mockChat.openConversation
export const getMessages = mockChat.getMessages
export const sendMessage = mockChat.sendMessage
export const getUnreadCount = mockChat.getUnreadCount

/* ------------------------- Hisob: tasdiq, tarif -------------------------- */

export const verifyFarmer = mockAccount.verifyFarmer
export const purchasePremium = mockAccount.purchasePremium
export const cancelPremium = mockAccount.cancelPremium
export const estimateYield = mockAccount.estimateYield

/* ------------------------------ Tranzaksiya ------------------------------ */

export const createTransaction = mockTransactions.createTransaction
export const getTransactions = mockTransactions.getTransactions
export const getTransaction = mockTransactions.getTransaction
export const advanceTransaction = mockTransactions.advanceTransaction
export const submitWeighbridgeReceipt = mockTransactions.submitWeighbridgeReceipt

/* ------------------------------- Xizmatchi ------------------------------- */

/** MOCK bazani tozalash (sozlamalardagi "keshni tozalash"). */
export const resetMockData = resetDb
