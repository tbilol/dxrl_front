import { useEffect, useState } from 'react'
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
import { ChartIcon } from '../components/Icons.jsx'
import { errorMessage, getStatsSummary, getTopAuctions, getTopRequests } from '../api.js'
import { formatNumber } from '../utils.js'

const FILTERS = [
  { key: 'all', label: 'Barchasi' },
  { key: 'farmers', label: 'Dehqonlar' },
  { key: 'buyers', label: 'Sotib oluvchilar' },
]

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const row = payload[0].payload
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e1d8',
        borderRadius: 10,
        padding: '8px 11px',
        boxShadow: '0 4px 14px rgba(35,41,31,0.1)',
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{row.product}</div>
      <div>{formatNumber(row.total_quantity)} tonna</div>
      <div style={{ color: '#7d8474' }}>{row.count} ta e'lon</div>
    </div>
  )
}

function TopChart({ title, subtitle, data, color, loading }) {
  return (
    <section className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-sub">{subtitle}</p>

      {loading ? (
        <div className="skeleton" style={{ height: 220, margin: '0 10px' }} />
      ) : data.length === 0 ? (
        <div className="empty" style={{ padding: '28px 16px' }}>
          <p>Ma'lumot yetarli emas</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38 + 30)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 22, bottom: 0, left: 6 }}
          >
            <CartesianGrid horizontal={false} stroke="#eeebe2" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#7d8474' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="product"
              width={86}
              tick={{ fontSize: 12, fill: '#23291f' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(46,107,46,0.06)' }} />
            <Bar dataKey="total_quantity" radius={[0, 6, 6, 0]} barSize={20}>
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

export default function StatsPage() {
  const [filter, setFilter] = useState('all')
  const [topAuctions, setTopAuctions] = useState([])
  const [topRequests, setTopRequests] = useState([])
  const [summary, setSummary] = useState({ auctions_count: 0, requests_count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getTopAuctions(), getTopRequests(), getStatsSummary()])
      .then(([auctions, requests, sum]) => {
        if (!active) return
        setTopAuctions(auctions)
        setTopRequests(requests)
        setSummary(sum)
      })
      .catch((err) => active && setError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const showAuctions = filter === 'all' || filter === 'farmers'
  const showRequests = filter === 'all' || filter === 'buyers'

  return (
    <>
      <Header title="Statistika" subtitle="Eng ko'p taklif va talab qilingan mahsulotlar" />

      <main className="page">
        {error && <div className="alert">{error}</div>}

        <div className="filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="summary-row">
          <div className="summary-card">
            <div className="num">{summary.auctions_count ?? 0}</div>
            <div className="cap">Jami auksionlar</div>
          </div>
          <div className="summary-card orange">
            <div className="num">{summary.requests_count ?? 0}</div>
            <div className="cap">Jami so'rovlar</div>
          </div>
        </div>

        {showAuctions && (
          <TopChart
            title="Dehqonlar auksiondagi top mahsulotlar"
            subtitle="Umumiy miqdor bo'yicha (tonna)"
            data={topAuctions}
            color="#2E6B2E"
            loading={loading}
          />
        )}

        {showRequests && (
          <TopChart
            title="Sotib oluvchilar so'rovlaridagi top mahsulotlar"
            subtitle="Umumiy miqdor bo'yicha (tonna)"
            data={topRequests}
            color="#D4732A"
            loading={loading}
          />
        )}

        {!loading && !error && topAuctions.length === 0 && topRequests.length === 0 && (
          <div className="empty">
            <div className="empty-icon">
              <ChartIcon size={30} />
            </div>
            <h3>Statistika bo'sh</h3>
            <p>E'lonlar qo'shilgach, bu yerda grafiklar paydo bo'ladi.</p>
          </div>
        )}
      </main>
    </>
  )
}
