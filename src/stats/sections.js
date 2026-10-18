/**
 * Statistika bo'limlarining YAGONA ta'rifi.
 *
 * Sakkiz bo'limning har biri shu yerda bir marta tasvirlanadi: qaysi
 * ma'lumotdan hisoblanadi, qanday ko'rinishda chiziladi, sarlavhasi qanday.
 * Bosh sahifa (StatsPage) ham, "Batafsil" sahifasi (StatsDetailPage) ham
 * aynan shu jadvalni o'qiydi — shuning uchun ikkisida bo'limlar ro'yxati
 * hech qachon bir-biridan farq qilmaydi.
 *
 * `type` — marshrut parametri: /statistika/batafsil/<type>
 */

import {
  CoinsIcon,
  GlobeIcon,
  ScaleIcon,
  TrendIcon,
  UserIcon,
  UsersIcon,
} from '../components/Icons.jsx'
import {
  activeRegions,
  priceTrend,
  rankPeople,
  topProductsByRevenue,
  topProductsByWeight,
} from './analytics.js'

/** Bosh sahifada har bir bo'lim shuncha qator ko'rsatadi. */
export const TOP_N = 10

/** "Batafsil" sahifasidagi eng ko'p qator soni. */
export const MAX_N = 200

/**
 * view:
 *   'bars'    — mahsulotlar ustunli diagrammasi + raqamli ro'yxat
 *   'board'   — avatarli reyting (dehqonlar / xaridorlar)
 *   'trend'   — narx dinamikasi (chiziqli diagramma)
 *   'regions' — hududlar ustunli diagrammasi + raqamli ro'yxat
 */
export const SECTIONS = {
  'products-weight': {
    type: 'products-weight',
    view: 'bars',
    metric: 'quantity',
    icon: ScaleIcon,
    titleKey: 'stats.topSoldWeight',
    hintKey: 'stats.topSoldWeightHint',
  },
  'products-revenue': {
    type: 'products-revenue',
    view: 'bars',
    metric: 'revenue',
    icon: CoinsIcon,
    titleKey: 'stats.topSoldSum',
    hintKey: 'stats.topSoldSumHint',
  },
  'farmers-weight': {
    type: 'farmers-weight',
    view: 'board',
    metric: 'quantity',
    countLabelKey: 'stats.countListings',
    icon: UserIcon,
    titleKey: 'stats.topFarmersWeight',
    hintKey: 'stats.topFarmersWeightHint',
  },
  'farmers-revenue': {
    type: 'farmers-revenue',
    view: 'board',
    metric: 'revenue',
    countLabelKey: 'stats.countSales',
    icon: CoinsIcon,
    titleKey: 'stats.topFarmersSum',
    hintKey: 'stats.topFarmersSumHint',
  },
  'buyers-weight': {
    type: 'buyers-weight',
    view: 'board',
    metric: 'quantity',
    countLabelKey: 'stats.countRequests',
    icon: UsersIcon,
    titleKey: 'stats.topBuyersWeight',
    hintKey: 'stats.topBuyersWeightHint',
  },
  'buyers-revenue': {
    type: 'buyers-revenue',
    view: 'board',
    metric: 'revenue',
    countLabelKey: 'stats.countPurchases',
    icon: CoinsIcon,
    titleKey: 'stats.topBuyersSum',
    hintKey: 'stats.topBuyersSumHint',
  },
  'price-trend': {
    type: 'price-trend',
    view: 'trend',
    icon: TrendIcon,
    titleKey: 'stats.priceTrend',
    hintKey: 'stats.priceTrendHint',
  },
  regions: {
    type: 'regions',
    view: 'regions',
    icon: GlobeIcon,
    titleKey: 'stats.activeRegions',
    hintKey: 'stats.activeRegionsHint',
  },
}

/** Bosh sahifadagi guruhlar — tartib spetsifikatsiyadagidek. */
export const GROUPS = [
  { key: 'products', labelKey: 'stats.groupProducts', types: ['products-weight', 'products-revenue'] },
  { key: 'farmers', labelKey: 'stats.groupFarmers', types: ['farmers-weight', 'farmers-revenue'] },
  { key: 'buyers', labelKey: 'stats.groupBuyers', types: ['buyers-weight', 'buyers-revenue'] },
  { key: 'extra', labelKey: 'stats.groupExtra', types: ['price-trend', 'regions'] },
]

/** Noto'g'ri marshrut parametri — bo'lim topilmasa null. */
export function getSection(type) {
  return SECTIONS[type] ?? null
}

/** Bo'limning "Batafsil" manzili. */
export function sectionPath(type) {
  return `/statistika/batafsil/${type}`
}

/**
 * Bo'lim uchun qatorlarni hisoblaydi.
 *
 * Natija har doim { rows, trend }: `rows` — reyting qatorlari (ro'yxat va
 * ustunlar shundan chiziladi), `trend` — faqat narx dinamikasi uchun
 * diagramma ma'lumoti.
 */
export function sectionData(type, { offers, requests, period }, limit) {
  const section = SECTIONS[type]
  if (!section) return { rows: [], trend: null }

  switch (section.view) {
    case 'bars':
      return {
        rows:
          section.metric === 'revenue'
            ? topProductsByRevenue(offers, limit)
            : topProductsByWeight(offers, limit),
        trend: null,
      }

    case 'board': {
      const items = type.startsWith('buyers') ? requests : offers
      return { rows: rankPeople(items, section.metric, limit), trend: null }
    }

    case 'trend': {
      const trend = priceTrend(offers, period, undefined, limit)
      return { rows: trend.products, trend }
    }

    case 'regions':
      return { rows: activeRegions(offers, requests, limit), trend: null }

    default:
      return { rows: [], trend: null }
  }
}


/**
 * Statistika ikki ko'rinishda ochiladi: dehqonlar doskasidan va olib
 * sotuvchilar doskasidan. Har biri o'z guruhlarini ko'rsatadi.
 *
 * Bu bo'lim qayta loyihalanmoqda — shuning uchun ro'yxat ataylab shu yerda,
 * bitta jadvalda turadi: yangi kesim qo'shish yoki olib tashlash uchun faqat
 * shu massiv o'zgaradi, sahifalarga tegilmaydi.
 */
export const SCOPES = {
  farmer: {
    id: 'farmer',
    titleKey: 'stats.farmerTitle',
    subtitleKey: 'stats.farmerSubtitle',
    backTo: '/',
    groups: [
      { key: 'products', labelKey: 'stats.groupProducts', types: ['products-weight', 'products-revenue'] },
      { key: 'farmers', labelKey: 'stats.groupFarmers', types: ['farmers-weight', 'farmers-revenue'] },
      { key: 'extra', labelKey: 'stats.groupExtra', types: ['price-trend', 'regions'] },
    ],
    initialOpen: { 'products-weight': true, 'farmers-weight': true },
  },
  reseller: {
    id: 'reseller',
    titleKey: 'stats.resellerTitle',
    subtitleKey: 'stats.resellerSubtitle',
    backTo: '/sorovlar',
    groups: [
      { key: 'buyers', labelKey: 'stats.groupBuyers', types: ['buyers-weight', 'buyers-revenue'] },
      { key: 'products', labelKey: 'stats.groupProducts', types: ['products-weight', 'products-revenue'] },
      { key: 'extra', labelKey: 'stats.groupExtra', types: ['regions'] },
    ],
    initialOpen: { 'buyers-weight': true, 'products-weight': true },
  },
}

export function getScope(id) {
  return SCOPES[id] ?? SCOPES.farmer
}
