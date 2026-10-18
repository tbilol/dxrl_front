import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import { useT } from '../../i18n/index.jsx'
import { forDark, productColor } from '../../stats/products.js'
import { compactAxis, formatSum } from '../../stats/format.js'

/**
 * Narx dinamikasi — eng ko'p savdo qilinadigan 5 ta mahsulot.
 * Narx: so'm/tonna.
 *
 * Mahsulot nomiga bosilsa — o'sha chiziq ajratiladi (qolganlari xiralashadi)
 * va nuqtalari ko'rsatiladi. Qayta bosilsa hammasi qaytadi.
 *
 * `products` — ko'rsatiladigan mahsulotlar ro'yxati (bosh sahifada faqat
 * birinchi o'ntasi, "Batafsil" sahifasida to'liq ro'yxat). `trend.rows` da
 * barcha mahsulot kalitlari bor, lekin chizilmagani diagrammaga umuman
 * tushmaydi.
 */
export default function PriceTrendChart({ trend, colors, isDark, products, height = 260 }) {
  const t = useT()
  const [active, setActive] = useState(null)
  const shown = products ?? trend.products

  const colorOf = (product) => {
    const base = productColor(product)
    return isDark ? forDark(base) : base
  }

  return (
    <>
      <div className="trend-legend" role="group" aria-label={t('stats.priceTrend')}>
        {shown.map((product) => {
          const on = active === null || active === product
          return (
            <button
              key={product}
              type="button"
              className={`trend-key${active === product ? ' is-active' : ''}`}
              aria-pressed={active === product}
              onClick={() => setActive((prev) => (prev === product ? null : product))}
              style={{ opacity: on ? 1 : 0.4 }}
            >
              <span className="trend-swatch" style={{ background: colorOf(product) }} />
              {product}
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={trend.rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: colors.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={12}
          />
          <YAxis
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickFormatter={(v) => compactAxis(v, t)}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <Tooltip
            cursor={{ stroke: colors.axis, strokeDasharray: '3 3' }}
            content={
              <ChartTooltip
                colors={colors}
                title={(row, label) => label ?? row.label}
                rows={(row, payload) =>
                  payload
                    .filter((p) => p.value != null && (active === null || p.dataKey === active))
                    .map((p) => ({
                      key: p.dataKey,
                      color: colorOf(p.dataKey),
                      text: `${p.dataKey}: ${formatSum(p.value, t)}/${t('units.tonShort')}`,
                    }))
                }
              />
            }
          />

          {shown.map((product) => {
            const dim = active !== null && active !== product
            return (
              <Line
                key={product}
                type="monotone"
                dataKey={product}
                stroke={colorOf(product)}
                strokeWidth={active === product ? 2.6 : 1.8}
                strokeOpacity={dim ? 0.18 : 1}
                dot={active === product ? { r: 3, strokeWidth: 0 } : false}
                activeDot={dim ? false : { r: 4 }}
                connectNulls
                isAnimationActive
                animationDuration={300}
                animationEasing="ease-out"
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
