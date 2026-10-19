# AGROGRAM: frontend ↔ backend API contract

This is the HTTP surface the frontend needs to replace `src/services/mock/*`
with real calls. Every function exported from `src/services/index.js` maps
to one row below. **The mocks stay in place for now.** This document is the
target to build against. It does not describe what is wired today.

Companion docs: `MOCKS.md` (what each mock fakes), backend `README.md` and
`proto/` (the gRPC services behind the edge).

## Conventions

- **Edge.** The browser talks only to the api-gateway (Kong/Envoy, gRPC↔JSON).
  Its config does not exist yet ("comes later" in the backend README), so
  **every route below still needs an edge mapping**, including the ones whose
  gRPC service is already implemented.
- **Base path.** `/api/v1`. The paths in `src/api.js` (`/api/auctions`,
  `/api/conversations`, …) belong to the retired FastAPI backend (`back/_legacy`)
  and are not the target.
- **Auth.** `Authorization: Bearer <access_token>`. The edge validates it and
  forwards identity as gRPC metadata. A 401 makes the frontend clear the
  token (`src/api.js` interceptor, `services/errors.js`).
- **Errors.** Body `{ "detail": string | [{ "msg": string }], "code"?: string, ... }`.
  `services/errors.js` reads `response.status`, `data.detail` and `data.code`.
- **IDs.** UUID strings on the backend. The frontend treats ids as opaque
  strings. Mock ids such as `offer-12` and `dehqon-3` are mock-only.
- **Timestamps.** ISO-8601. The mock sends UTC without a zone suffix
  (`utils.js` `parseDate` accepts both).
- **Field names.** Below are the **JSON names the frontend reads today**
  (snake_case, flat). The protos use richer types (`Mass`, `UnitPrice`,
  `Address`, `MediaRef`, `ProductType` enum). The edge, or a thin
  `services/real/` adapter, must translate. Each section lists the mismatches.

## Status legend

| Mark | Meaning |
| --- | --- |
| ✅ gRPC | RPC exists and is implemented in a Go service; needs only the edge route + JSON mapping |
| 🟡 proto | RPC is defined in `proto/` but the service has no implementation yet |
| ❌ none | **No backend at all**: no proto, no service |

---

## 1. Auth (`mock/auth.js`) → `auth-gateway`, `identity`

| Function | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| `signInWithGoogle` | `GET /api/v1/auth/google/login` → redirect → `POST /api/v1/auth/sign-in` | `{ google: { id_token } }` | `Session` | ✅ gRPC `SignIn` |
| `signInWithApple` | `GET /api/v1/auth/apple/login` → redirect → `POST /api/v1/auth/sign-in` | `{ apple: { id_token, … } }` | `Session` | ✅ gRPC `SignIn` |
| `phoneLogin` | `POST /api/v1/auth/sign-in` | `{ phone, password }` | `Session` | ✅ gRPC `SignIn` (`phone_password`) |
| `phoneRegister` | `POST /api/v1/auth/phone/sign-up` | `{ name, phone, password }` | `Session` | ✅ gRPC `SignUpWithPhone` (also needs `RequestPhoneCode` if SMS verification is required; the UI has no code step yet) |
| `getMe` | `GET /api/v1/me` | none | `Profile` (own) | ⚠️ edge composition: `identity.GetAccount` + `profile-social.GetProfile` + sign-in flags (`ListSignInMethods` is 🟡 proto) |
| `linkPhonePassword` | `POST /api/v1/auth/methods/phone` | `{ phone, password }` | `Profile` (own) | ✅ gRPC `LinkSignInMethod` |
| `unlinkPhonePassword` | `DELETE /api/v1/auth/methods/phone` | none | `Profile` (own) | ✅ gRPC `UnlinkSignInMethod` |
| link Google/Apple (`SettingsSubPage.linkOAuth`) | `POST /api/v1/auth/methods/{google\|apple}` | `{ id_token }` | `Profile` (own) | ✅ gRPC `LinkSignInMethod`. **Today the mock fakes this with `updateProfile({ has_google: true })`; that must be replaced.** |
| `endSession` | `POST /api/v1/auth/sign-out` | none | `204` | ✅ gRPC `SignOut` |
| (token refresh) | `POST /api/v1/auth/refresh` | `{ refresh_token }` | `Session` | ✅ gRPC `RefreshToken`. **The frontend has no refresh logic yet**: it holds one 30-day token. |

```jsonc
// Session
{ "access_token": "jwt", "refresh_token": "…", "profile": Profile }
```

The frontend decodes `access_token` as a JWT and reads `sub` and `exp`
(`src/auth.js`).

---

## 2. Listings (`mock/listings.js`) → `catalog`

The backend has **one** listing model and the board is `kind`. The frontend
keeps one function pair per board (`getOffers` / `getRequests`, …). Both
map onto the same routes with `kind=offer|request`.

| Function | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| `getOffers(params)` / `getRequests(params)` | `GET /api/v1/listings?kind=offer\|request` | query: `owner_id?`, `status?` (`active` default; `all` / `closed` only for own listings), `product?` (text) | `Listing[]`, newest first | ✅ gRPC `ListListings` (text search → `SearchListings`) |
| `getOffer(id)` / `getRequest(id)` | `GET /api/v1/listings/{id}` | none | `Listing` (404 `{ detail }` if missing) | ✅ gRPC `GetListing` |
| `createOffer(data)` / `createRequest(data)` | `POST /api/v1/listings` | `ListingInput` + `kind` | `201 Listing` · **`409 listing_limit`** | ✅ gRPC `CreateListing` |
| `updateOffer(id, data)` / `updateRequest(id, data)` | `PATCH /api/v1/listings/{id}` | partial `ListingInput` | `Listing` | ✅ gRPC `UpdateListing` (field mask) |
| **close** (`updateX(id, { status: 'closed' })`) | `POST /api/v1/listings/{id}/close` | none | `Listing` | ❌ **none**: `UpdateListing`'s mask allows only product, quantity, price, phone, address, notes and media, so `status` cannot be changed and there is no Close RPC |
| **reopen** (`updateX(id, { status: 'active' })`) | `POST /api/v1/listings/{id}/reopen` | none | `Listing` · **`409 listing_limit`** | ❌ **none** (same reason) |
| `deleteOffer(id)` / `deleteRequest(id)` | `DELETE /api/v1/listings/{id}` | none | `204` (mock returns `{ ok: true }`) | ✅ gRPC `DeleteListing` (soft delete) |
| `countMyListings(kind, userId)` | `GET /api/v1/me/listings/count?kind=offer\|request` | none | `{ active: number, limit: 10 }` | ❌ **none**: derivable from `ListListings(owner_id, statuses=[ACTIVE])`, but a dedicated count avoids paging |
| `uploadListingImages(id, files)` | `POST /api/v1/media/uploads` then `PATCH /api/v1/listings/{id}` `{ media }` | see `media-pipeline` | `{ ok, uploaded }` | 🟡 proto (`media-pipeline` has no implementation) |

```jsonc
// Listing (what ListingCard / ListingDetailPage read)
{
  "id": "uuid",
  "kind": "offer" | "request",
  "product": "Kartoshka",          // canonical Uzbek name
  "product_id": "kartoshka",       // stable key from src/data/products.js
  "quantity": 12.5,                // tonnes
  "price": 6000 | null,            // offer: UZS per kg; null = negotiable
  "offer_price": 6000 | null,      // request: same meaning
  "phone": "+998 90 123 45 67",    // detail page only, behind "Raqamni ko'rsatish"
  "address": "Samarqand, Urgut tumani" | null,
  "notes": "…" | null,
  "status": "active" | "closed",
  "owner_id": "uuid",
  "owner": { "id", "name", "avatar_url", "role" } | null,
  "farmer_name" | "buyer_name": "…",  // name typed on the form
  "views_count": 0,
  "has_video": false,
  "created_at": "…", "updated_at"?: "…"
}

// ListingInput (ListingFormPage payload)
{ product, product_id, quantity, phone, address, notes,
  farmer_name | buyer_name, price | offer_price, has_video }
```

**Proto mismatches the adapter must resolve:**

- `price` vs `offer_price`: the proto has one `price` field (`UnitPrice`, minor units, per kg/t).
- `quantity`: tonnes as a number vs `Mass { grams }`.
- `address`: one free-text string vs a structured `Address` (region enum + district). The form already holds region and district separately and only joins them for display.
- `product` / `product_id` vs the `ProductType` enum. `ProductTypeInfo.key` is the bridge.
- phone: the proto requires `^\+998[0-9]{9}$`; the form sends the formatted `+998 90 123 45 67`.
- `farmer_name` / `buyer_name`: no proto field (the owner card comes from the profile).
- `has_video`: no proto field (derive it from `media`).
- `owner`: the proto has `{ user_id, display_name, avatar }`; there is no `role`.

### Quota: 10 ACTIVE listings per board

- Counts only `status === 'active'`, and offers and requests are counted **separately** (`src/limits.js`, `LISTING_LIMIT = 10`).
- Enforced on **create** and on **reopen** (closed → active).
- Required error response:

```jsonc
HTTP 409
{ "code": "listing_limit", "limit": 10, "detail": "Faol e'lonlar chegarasi tugadi" }
```

`services/errors.js` keys on `data.code === 'listing_limit'` and reads
`data.limit`. **The backend raises `ERROR_REASON_LISTING_LIMIT_REACHED`
as gRPC `RESOURCE_EXHAUSTED`, which a default gRPC↔JSON mapping turns into
HTTP 429, not 409, with `metadata.limit` as a string.** The edge must map it
to the shape above.

### Visibility

- Board (`owner_id` unset): active only.
- `owner_id` = caller: all statuses (the profile's "My listings" shows closed ones dimmed, with a reopen action).
- `owner_id` = someone else: active only. This matches `ListingFilter.statuses` in the proto, and the mock now does the same.

---

## 3. Profile & follow (`mock/profiles.js`) → `profile-social`

| Function | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| `getProfiles()` | `GET /api/v1/profiles` | none | `Profile[]` | ❌ none (no list RPC). Check whether any screen still needs it before building one. |
| `getProfile(id)` | `GET /api/v1/profiles/{id}` | none | `Profile` (404 `{ detail }`) | ✅ gRPC `GetProfile` |
| `createProfile(data)` | `POST /api/v1/profiles` | `{ name, … }` | `Profile` | ✅ gRPC `CreateProfile` (normally triggered by sign-up) |
| `updateProfile(id, data)` | `PATCH /api/v1/profiles/{id}` | `{ name?, address?, phone? }` | `Profile` | ✅ gRPC `UpdateProfile` |
| `deleteProfile(id)` | `DELETE /api/v1/profiles/{id}` | none | `204` | ✅ gRPC `DeleteProfile` |
| `uploadAvatar(id, file)` | `POST /api/v1/media/uploads` then `PATCH /api/v1/profiles/{id}` `{ avatar }` | multipart / upload URL | `Profile` | 🟡 proto (`media-pipeline`) |
| `followProfile(id)` | `POST /api/v1/profiles/{id}/follow` | none | `{ is_followed: true, followers_count }` | ✅ gRPC `FollowUser` |
| `unfollowProfile(id)` | `DELETE /api/v1/profiles/{id}/follow` | none | `{ is_followed: false, followers_count }` | ✅ gRPC `UnfollowUser` |
| `getFollowers(id)` | `GET /api/v1/profiles/{id}/followers` | none | `Profile[]` (mini) | ✅ gRPC `ListFollowers` |
| `getFollowing(id)` | `GET /api/v1/profiles/{id}/following` | none | `Profile[]` (mini) | ✅ gRPC `ListFollowing` |

```jsonc
// Profile
{
  "id": "uuid", "name": "…", "role": "dehqon" | "sotib_oluvchi" | null,
  "avatar_url": "…" | null, "address": "…" | null,
  "phone": "…" | null, "email": "…" | null,           // own profile only
  "has_password": bool, "has_google": bool, "has_apple": bool,  // own profile only
  "is_me": bool, "is_followed": bool,
  "followers_count": n, "following_count": n,
  "active_offers_count": n, "active_requests_count": n,  // the profile's listing count = sum of these
  "created_at": "…"
}
```

Mismatches: `name` ↔ `display_name`, `address` ↔ `region` + `district`,
`followers_count` ↔ `follower_count`, `is_followed` ↔ `is_followed_by_me`,
`avatar_url` ↔ `MediaRef`. The proto has no `role` (the boards are open to
everyone, so the UI may drop it). The active-listing counts are not on the
proto `Profile`, so they come from `ListUserListings` or a counter.

---

## 4. Favorites (`src/listings/favorites.js`): ❌ NO BACKEND

Favorites live only in `localStorage` (key `kind:id`) and are not synced
across devices. No proto, no service.

| Purpose | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| list saved | `GET /api/v1/me/favorites` | none | `[{ kind, listing_id, created_at, listing?: Listing }]` | ❌ none |
| save | `PUT /api/v1/me/favorites/{listing_id}` | none | `204` | ❌ none |
| unsave | `DELETE /api/v1/me/favorites/{listing_id}` | none | `204` | ❌ none |

Once listing ids are UUIDs that are unique across boards, the `kind:` prefix
in the local key becomes unnecessary. The server should drop favorites whose
listing was deleted, and return closed ones flagged as closed.

---

## 5. Calculator (`mock/account.js`) → `agri-calculator`

| Function | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| `estimateYield` | `POST /api/v1/calculator/yield` | `{ crop: "kartoshka", areaHa: 2.5, seedKg: 6000 }` | see below | 🟡 proto `EstimateYield` (the service is a Dockerfile only) |
| (crop norms, optional) | `GET /api/v1/calculator/norms` | none | `CropNorm[]` | 🟡 proto `ListCropNorms`. Today the norms are hard-coded in `src/data/products.js`. |

```jsonc
// Response the YieldEstimator reads
{ "crop", "areaHa", "seedKg", "expectedSeedKg",
  "tons", "minTons", "maxTons", "perHa" }
```

Mismatches: the proto takes `Area` and `Mass` and returns `estimated_yield*`
as `Mass` plus `recommended_seed_amount`, `seed_adequacy` and
`model_version`. The UI converts ga/sotix/m² into hectares before the call
(`components/calc/units.js`).

The plain calculator and calculation history are client-only and need no
backend.

---

## 6. Chat (`mock/chat.js`, `src/chat/*`): ❌ NO BACKEND

There is no messaging service or proto. `signaling` only covers calls
(WebRTC), and that service is a Dockerfile only.

| Function | Method & path | Request | Response | Backend |
| --- | --- | --- | --- | --- |
| `getConversations()` | `GET /api/v1/conversations` | none | `Conversation[]`, by `last_message_at` desc | ❌ none |
| `openConversation(otherUserId)` | `POST /api/v1/conversations` | `{ other_user_id }` | `Conversation` (existing or new) | ❌ none |
| `getMessages(conversationId)` | `GET /api/v1/conversations/{id}/messages` | query: `before?`, `limit?` | `Message[]` oldest→newest; marks the other side's messages read | ❌ none |
| `sendMessage(conversationId, content)` | `POST /api/v1/conversations/{id}/messages` | `{ content }` | `Message` | ❌ none |
| `getUnreadCount()` | `GET /api/v1/conversations/unread-count` | none | `{ unread_count }` (the mock returns a bare number) | ❌ none |
| real-time delivery | `WS /api/v1/ws` | none | `message.new`, `message.read`, `presence` events | ❌ none (the UI polls today) |
| attachments / voice | upload via `media-pipeline` | none | `MediaRef` on `Message` | 🟡 proto (`src/chat/media.js`, `voice.js` are local-only) |
| calls | signaling stream | none | none | 🟡 proto `signaling.StartCall/ExchangeSignals/EndCall` (`src/chat/calls.js`) |
| presence / last seen | `GET /api/v1/profiles/{id}/presence` or a WS event | none | `{ online, last_seen_at }` | ❌ none (`src/chat/presence.js`) |

```jsonc
// Conversation
{ "id", "other_user": { "id", "name", "avatar_url", "role" },
  "last_message": "…" | null, "last_message_at": "…",
  "last_message_sender_id": "…" | null, "unread_count": n }

// Message
{ "id", "conversation_id", "sender_id", "content", "is_read": bool, "created_at" }
```

---

## Summary: what has no backend yet

| Area | Gap |
| --- | --- |
| **Chat** (conversations, messages, unread, WS, presence) | no proto, no service |
| **Favorites sync** | no proto, no service |
| Listing **close / reopen** | `UpdateListing` cannot change `status`; needs Close/Reopen RPCs (with the quota check on reopen) |
| Active-listing **count** per board | no RPC (workaround: list and count) |
| `409 listing_limit` shape | the backend emits `RESOURCE_EXHAUSTED`; the edge must map it to 409 `{ code, limit, detail }` |
| `GET /me` | edge composition across identity, profile-social and auth-gateway; `ListSignInMethods` not implemented |
| Profiles list | no RPC |
| Calculator, media uploads, calls | proto only, services not implemented |
| **api-gateway** (gRPC↔JSON edge) | not configured: blocks every row above |
