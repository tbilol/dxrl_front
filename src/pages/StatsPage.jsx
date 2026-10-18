import { startTransition, useMemo, useState } from 'react'
import Header from '../components/Header.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import StatsFilters from '../components/stats/StatsFilters.jsx'
import StatSection from '../components/stats/StatSection.jsx'
import SectionView from '../components/stats/SectionView.jsx'
import { CoinsIcon, PackageIcon, ScaleIcon, UsersIcon } from '../components/Icons.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { useTheme } from '../theme.jsx'
import { chartPalette } from '../stats/palette.js'
import { formatSum } from '../stats/format.js'
import { summarize } from '../stats/analytics.js'
import { getScope, MAX_N, sectionData, sectionPath, SECTIONS, TOP_N } from '../stats/sections.js'
import useStatsData from '../stats/useStatsData.js'
import useLogMount from '../useLogMount.js'

/**
 * Qishloq xo'jaligi tahlil paneli.
 *
 * Tepada global filtrlar (davr + hudud) — ular ostidagi BARCHA sakkiz
 * bo'limga qo'llanadi. Har bir bo'lim yig'iladigan karta: yopiq bo'lsa
 * ichidagi diagramma umuman render bo'lmaydi, shuning uchun sahifa
 * mobilda ham tez ochiladi.
 *
 * Bu sahifa har bir bo'limda FAQAT birinchi o'ntasini ko'rsatadi. To'liq
 * ro'yxat (200 tagacha) alohida sahifada — "Batafsil" tugmasi
 * /statistika/batafsil/<type> ga o'tadi (StatsDetailPage).
 *
 * Barcha kesimlar mijoz tomonida hisoblanadi (stats/analytics.js), chunki
 * backendda filtrlangan statistika endpointlari hali yo'q.
 */

/**
 * `scope` — qaysi doskadan ochilgani: 'farmer' (dehqonlar) yoki 'reseller'
 * (olib sotuvchilar). Guruhlar ro'yxati stats/sections.js dagi SCOPES da.
 */
export default function StatsPage({ scope = 'farmer' }) {
  useLogMount('StatsPage')
  const view = getScope(scope)
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const colors = useMemo(() => chartPalette(isDark), [isDark])

  const stats = useStatsData()
  const { data, offers, requests, loading, usingMock } = stats

  const [open, setOpen] = useState(view.initialOpen)

  /*
   * Kesimlar bir marta MAX_N gacha hisoblanadi va kartalarda birinchi
   * o'ntasigacha qirqiladi. Shunday qilinishining sababi: ulush (share) va
   * faollik darajasi (intensity) TO'LIQ ro'yxatdan chiqadi, demak bosh
   * sahifadagi foizlar "Batafsil" sahifasidagi foizlar bilan bir xil
   * bo'ladi. Qo'shimcha ravishda "Batafsil" tugmasini ko'rsatish uchun
   * umumiy sanoq ham shu yerdan olinadi.
   */
  const sections = useMemo(
    () =>
      Object.keys(SECTIONS).map((type) => {
        const { rows, trend } = sectionData(type, data, MAX_N)
        return { type, rows, trend, total: rows.length }
      }),
    [data],
  )

  const byType = useMemo(
    () => new Map(sections.map((section) => [section.type, section])),
    [sections],
  )

  const summary = useMemo(
    () => summarize(scope === 'reseller' ? requests : offers),
    [offers, requests, scope],
  )
  const offerSummary = useMemo(() => summarize(offers), [offers])

  /* Ochish/yopish — past ustuvorlikda: bosish darhol seziladi, diagramma esa
     keyingi kadrlarda chiziladi. */
  const toggle = (type) => () =>
    startTransition(() => setOpen((prev) => ({ ...prev, [type]: !prev[type] })))

  const kpis = [
    {
      key: 'offers',
      label: t(scope === 'reseller' ? 'stats.kpiRequests' : 'stats.kpiOffers'),
      value: scope === 'reseller' ? requests.length : offerSummary.count,
      icon: PackageIcon,
    },
    { key: 'tonnage', label: t('stats.kpiTonnage'), value: summary.quantity, icon: ScaleIcon, decimals: 0 },
    { key: 'turnover', label: t('stats.kpiTurnover'), value: summary.revenue, icon: CoinsIcon, money: true },
    { key: 'people', label: t('stats.kpiParticipants'), value: summary.people, icon: UsersIcon },
  ]

  return (
    <PageShell width="wide">
      <Header
        title={t(view.titleKey)}
        subtitle={t(view.subtitleKey)}
        backTo={view.backTo}
        backLabel={t('common.back')}
      />

      <PullToRefresh onRefresh={stats.reload}>
        <main className="page">
          {stats.alert && <div className="alert">{stats.alert}</div>}
          {/* Bu bo'lim qayta loyihalanmoqda — ma'lumot namunaviy (MOCK). */}
          {usingMock && !loading && (
            <div className="alert alert-warn">{t('stats.mockNotice')}</div>
          )}

          {/* -------------------------- Global filtrlar ------------------------- */}
          <StatsFilters
            period={stats.period}
            onPeriod={stats.changePeriod}
            region={stats.region}
            district={stats.district}
            onRegion={stats.changeRegion}
            onDistrict={stats.changeDistrict}
            districts={stats.districts}
            lang={stats.lang}
          />

          {/* ------------------------ Umumiy ko'rsatkichlar --------------------- */}
          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <div key={kpi.key} className="kpi-card">
                <span className="kpi-label">
                  <kpi.icon size={13} />
                  {kpi.label}
                </span>
                <span className="kpi-value">
                  {loading ? (
                    '—'
                  ) : kpi.money ? (
                    <AnimatedNumber
                      value={kpi.value}
                      format={(n) => formatSum(n, t, { withUnit: false })}
                    />
                  ) : (
                    <AnimatedNumber value={kpi.value} decimals={kpi.decimals ?? 0} />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* --------------------------- Kesimlar ------------------------------ */}
          {view.groups.map((group) => (
            <div className="sgroup" key={group.key}>
              <h2 className="sgroup-title">{t(group.labelKey)}</h2>

              {group.types.map((type, i) => {
                const meta = SECTIONS[type]
                const section = byType.get(type)
                const shown = section.rows.slice(0, TOP_N)

                return (
                  <StatSection
                    key={type}
                    index={i + 1}
                    icon={meta.icon}
                    title={t(meta.titleKey)}
                    hint={t(meta.hintKey)}
                    open={Boolean(open[type])}
                    onToggle={toggle(type)}
                    loading={loading}
                    empty={!loading && section.total === 0}
                    /* "Batafsil" faqat ko'rsatilganidan ko'proq natija
                       bo'lganda — aks holda ochadigan narsa yo'q. */
                    detailTo={section.total > TOP_N ? sectionPath(type) : null}
                    total={section.total}
                  >
                    <SectionView
                      type={type}
                      rows={shown}
                      trend={section.trend}
                      colors={colors}
                      isDark={isDark}
                      usingMock={usingMock}
                    />
                  </StatSection>
                )
              })}
            </div>
          ))}
        </main>
      </PullToRefresh>
    </PageShell>
  )
}
