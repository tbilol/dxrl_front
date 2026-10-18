/**
 * Statistika ma'lumotlari + filtrlar — bitta qayta ishlatiladigan hook.
 *
 * Bosh sahifa va "Batafsil" sahifasi shu hookning ALOHIDA nusxasidan
 * foydalanadi: ikkisining filtrlari bir-biriga bog'liq emas (spetsifikatsiya
 * shuni talab qiladi — batafsil sahifasidagi filtr faqat o'sha sahifaga
 * ta'sir qiladi).
 *
 * Barcha kesimlar mijoz tomonida hisoblanadi (stats/analytics.js), chunki
 * backendda filtrlangan statistika endpointlari hali yo'q.
 */

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { errorMessage, getOffers, getRequests, USE_MOCK } from '../services/index.js'
import { useLanguage } from '../i18n/index.jsx'
import log from '../logger.js'
import { mockDataset } from './mock.js'
import { applyFilters, DEFAULT_PERIOD, districtOptions, normalizeItem } from './analytics.js'

export default function useStatsData() {
  const { lang, t } = useLanguage()

  const [period, setPeriod] = useState(DEFAULT_PERIOD)
  const [region, setRegion] = useState(null)
  const [district, setDistrict] = useState(null)

  const [raw, setRaw] = useState(null)
  const [usingMock, setUsingMock] = useState(false)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    let offers = []
    let requests = []
    let failed = false

    try {
      ;[offers, requests] = await Promise.all([getOffers(), getRequests()])
      setAlert('')
    } catch (err) {
      failed = true
      log.front.error("Statistikani yuklab bo'lmadi", err)
      setAlert(errorMessage(err, t))
    }

    /*
     * MOCK: statistika bo'limi qayta loyihalanmoqda va backendda filtrlangan
     * statistika endpointlari yo'q. Shuning uchun diagrammalar namunaviy
     * to'plam ustida chiziladi — foydalanuvchining haqiqiy e'lonlari esa
     * ustiga qo'shiladi, shunda o'z ma'lumoti ham kesimlarda ko'rinadi.
     */
    const isEmpty = offers.length === 0 && requests.length === 0
    if (USE_MOCK || failed || isEmpty) {
      const mock = mockDataset()
      offers = [...offers, ...mock.offers]
      requests = [...requests, ...mock.requests]
      setUsingMock(true)
      log.front("Statistika: namuna ma'lumotlar ishlatilmoqda", {
        offers: offers.length,
        requests: requests.length,
      })
    } else {
      setUsingMock(false)
      log.front('Statistika yuklandi', { offers: offers.length, requests: requests.length })
    }

    /* Diagrammalar daraxti katta — uni past ustuvorlikda chizamiz, shunda
       sahifa karkasi va filtrlar bosishga darhol javob beradi. */
    startTransition(() => {
      setRaw({
        offers: offers.map((it) => normalizeItem(it, 'offer')),
        requests: requests.map((it) => normalizeItem(it, 'request')),
      })
    })
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const filter = useMemo(() => ({ period, region, district }), [period, region, district])

  const offers = useMemo(() => (raw ? applyFilters(raw.offers, filter) : []), [raw, filter])
  const requests = useMemo(() => (raw ? applyFilters(raw.requests, filter) : []), [raw, filter])

  const districts = useMemo(
    () => (raw ? districtOptions([...raw.offers, ...raw.requests], region) : []),
    [raw, region],
  )

  /* Filtrlarni bosish darhol seziladi, diagrammalar esa keyingi kadrlarda
     qayta chiziladi. */
  const changePeriod = useCallback(
    (next) => startTransition(() => setPeriod(next)),
    [],
  )

  /* Viloyat almashsa tuman tanlovi bekor qilinadi. */
  const changeRegion = useCallback(
    (next) =>
      startTransition(() => {
        setRegion(next)
        setDistrict(null)
      }),
    [],
  )

  const changeDistrict = useCallback(
    (next) => startTransition(() => setDistrict(next)),
    [],
  )

  /** Filtrlar to'plami — sectionData() ga o'zgarmas ko'rinishda uzatiladi. */
  const data = useMemo(() => ({ offers, requests, period }), [offers, requests, period])

  return {
    lang,
    loading: raw === null,
    usingMock,
    alert,
    reload: load,

    period,
    region,
    district,
    districts,
    changePeriod,
    changeRegion,
    changeDistrict,

    offers,
    requests,
    data,
  }
}
