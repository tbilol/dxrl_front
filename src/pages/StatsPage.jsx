import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PageShell from '../components/PageShell.jsx'
import PullToRefresh from '../components/PullToRefresh.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import { ChartIcon } from '../components/Icons.jsx'
import { errorMessage, getStatsSummary, getTopAuctions, getTopRequests } from '../api.js'
import { useT } from '../i18n/index.jsx'
import { spring } from '../motion.js'
import { useTheme } from '../theme.jsx'
import { formatNumber } from '../utils.js'
import log from '../logger.js'
import useLogMount from '../useLogMount.js'

/**
 * Mavzuga mos diagramma ranglari. Recharts CSS o'zgaruvchilarini o'qiy olmaydi,
 * shuning uchun bu yerdagi qiymatlar index.css dagi tokenlar bilan bir xil:
 *   auction — asosiy jigarrang, request — zaytun yashil.
 */
function chartPalette(isDark) {
  return {
    auction: isDark ? '#c4a68f' : '#a98b76',
    request: isDark ? '#c8ce9f' : '#8a9059',
    grid: isDark ? '#3a2e26' : '#e8d9c5',
    axis: isDark ? '#b8a898' : '#7a6555',
    label: isDark ? '#f3e4c9' : '#3d2e22',
    surface: isDark ? '#2a2220' : '#ffffff',
    border: isDark ? '#3a2e26' : '#e8d9c5',
    cursor: isDark ? 'rgba(243,228,201,0.08)' : 'rgba(169,139,118,0.14)',
    shadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(61,46,34,0.14)',
  }
}

function ChartTooltip({ active, payload, colors, t }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '9px 12px',
        boxShadow: colors.shadow,
        fontSize: 13,
        color: colors.label,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{row.product}</div>
      <div>
        {formatNumber(row.total_quantity)} {t('units.ton')}
      </div>
      <div style={{ color: colors.axis }}>
        {row.count} {t('units.pieces')}
      </div>
    </div>
  )
}

function TopChart({ title, data, color, colors, loading, t }) {
  return (
    <section className="chart-card">
      <h3 className="chart-title">{title}</h3>

      {loading ? (
        <BlockSkeleton height={200} />
      ) : data.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: 13.5, margin: 0, textAlign: 'center' }}>
          {t('stats.empty')}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(170, data.length * 38 + 24)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 4 }}>
            <CartesianGrid horizontal={false} stroke={colors.grid} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: colors.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="product"
              width={88}
              tick={{ fontSize: 12, fill: colors.label }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip colors={colors} t={t} />}
              cursor={{ fill: colors.cursor }}
            />
            <Bar dataKey="total_quantity" radius={[0, 7, 7, 0]} barSize={20} animationDuration={600}>
              {data.map((entry) => (
                <Cell key={entry.product} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

const FILTERS = [
  { key: 'all', labelKey: 'stats.filterAll' },
  { key: 'farmers', labelKey: 'stats.filterFarmers' },
  { key: 'buyers', labelKey: 'stats.filterBuyers' },
]

export default function StatsPage() {
  useLogMount('StatsPage')
  const t = useT()
  const { isDark } = useTheme()
  const colors = chartPalette(isDark)

  const [filter, setFilter] = useState('all')
  const [topAuctions, setTopAuctions] = useState([])
  const [topRequests, setTopRequests] = useState([])
  const [summary, setSummary] = useState({ auctions_count: 0, requests_count: 0 })
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState('')

  const load = useCallback(async () => {
    try {
      const [auctions, requests, sum] = await Promise.all([
        getTopAuctions(),
        getTopRequests(),
        getStatsSummary(),
      ])
      setTopAuctions(auctions)
      setTopRequests(requests)
      setSummary(sum)
      log.front('Statistika yuklandi', {
        auctions: auctions.length,
        requests: requests.length,
        ...sum,
      })
      setAlert('')
    } catch (err) {
      setAlert(errorMessage(err, t))
      log.front.error("Statistikani yuklab bo'lmadi", err)
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const showAuctions = filter === 'all' || filter === 'farmers'
  const showRequests = filter === 'all' || filter === 'buyers'
  const isEmpty = !loading && !alert && topAuctions.length === 0 && topRequests.length === 0

  return (
    <PageShell width="wide">
      <Header title={t('stats.title')} subtitle={t('stats.subtitle')} />

      <PullToRefresh onRefresh={load}>
        <main className="page">
          {alert && <div className="alert">{alert}</div>}

          <div className="segment" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                className={`segment-btn${filter === f.key ? ' active' : ''}`}
                onClick={() => {
                  log.front('Statistika filtri', f.key)
                  setFilter(f.key)
                }}
              >
                {filter === f.key && (
                  <motion.span layoutId="stats-ind" className="segment-ind" transition={spring} />
                )}
                <span>{t(f.labelKey)}</span>
              </button>
            ))}
          </div>

          <div className="stat-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
            >
              <div className="stat-value" style={{ color: colors.auction }}>
                {summary.auctions_count ?? 0}
              </div>
              <div className="stat-label">{t('stats.totalAuctions')}</div>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: 0.06 }}
            >
              <div className="stat-value" style={{ color: colors.request }}>
                {summary.requests_count ?? 0}
              </div>
              <div className="stat-label">{t('stats.totalRequests')}</div>
            </motion.div>
          </div>

          {isEmpty ? (
            <EmptyState icon={ChartIcon} title={t('stats.empty')} text={t('stats.emptyHint')} />
          ) : (
            /* Desktopda diagrammalar ikki ustunda yonma-yon. */
            <div className="chart-grid">
              {showAuctions && (
                <TopChart
                  title={t('stats.topAuctions')}
                  data={topAuctions}
                  color={colors.auction}
                  colors={colors}
                  loading={loading}
                  t={t}
                />
              )}

              {showRequests && (
                <TopChart
                  title={t('stats.topRequests')}
                  data={topRequests}
                  color={colors.request}
                  colors={colors}
                  loading={loading}
                  t={t}
                />
              )}
            </div>
          )}
        </main>
      </PullToRefresh>
    </PageShell>
  )
}
