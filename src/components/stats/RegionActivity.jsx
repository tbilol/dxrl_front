import VerticalBars from './VerticalBars.jsx'
import ValueList from './ValueList.jsx'
import { useT } from '../../i18n/index.jsx'
import { formatTons } from '../../stats/format.js'
import { formatNumber } from '../../utils.js'

/**
 * Eng faol hududlar — bitimlar (takliflar + so'rovlar) soni bo'yicha,
 * vertikal ustunlarda. Ustun rangi faollikka qarab ochiqdan to'qqa o'zgaradi.
 */

/** Ikki rang orasidagi oraliq qiymat (0..1). */
function mix(from, to, k) {
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [r1, g1, b1] = parse(from)
  const [r2, g2, b2] = parse(to)
  const to2 = (n) => Math.round(n).toString(16).padStart(2, '0')
  return `#${to2(r1 + (r2 - r1) * k)}${to2(g1 + (g2 - g1) * k)}${to2(b1 + (b2 - b1) * k)}`
}

export default function RegionActivity({ data, colors, isDark, virtual = false, chartHeight }) {
  const t = useT()

  // Ochiqdan to'qqa: kam faol hudud — och, eng faoli — to'yingan.
  const LOW = isDark ? '#24402c' : '#d3e8d8'
  const HIGH = isDark ? '#3b9f4c' : '#1b5e20'
  const shade = (intensity) => mix(LOW, HIGH, 0.25 + intensity * 0.75)

  return (
    <>
      <VerticalBars
        data={data}
        dataKey="count"
        categoryKey="region"
        colors={colors}
        colorOf={(row) => shade(row.intensity)}
        axisFormat={(v) => formatNumber(v)}
        labelFormat={(v) => formatNumber(Math.round(v))}
        tooltipTitle={(row) => row.region}
        tooltipRows={(row) => [
          {
            key: 'c',
            color: shade(row.intensity),
            text: t('stats.transactions', { count: formatNumber(row.count) }),
          },
          { key: 'q', color: colors.axis, text: formatTons(row.quantity, t) },
          {
            key: 'b',
            color: colors.axis,
            text: `${t('stats.offersShort')}: ${row.offers} · ${t('stats.requestsShort')}: ${row.requests}`,
          },
        ]}
        height={chartHeight}
      />

      <ValueList
        rows={data}
        virtual={virtual}
        keyOf={(row) => row.region}
        colorOf={(row) => shade(row.intensity)}
        nameOf={(row) => row.region}
        valueOf={(row) => t('stats.transactions', { count: formatNumber(row.count) })}
        extraOf={(row) => formatTons(row.quantity, t)}
      />
    </>
  )
}
