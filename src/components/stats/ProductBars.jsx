import VerticalBars from './VerticalBars.jsx'
import ValueList from './ValueList.jsx'
import { useT } from '../../i18n/index.jsx'
import { assignColors, forDark, productBorder } from '../../stats/products.js'
import { compactAxis, formatShare, formatSum, formatTons } from '../../stats/format.js'
import { formatNumber } from '../../utils.js'

/**
 * Mahsulotlar reytingi — vertikal ustunli diagramma.
 *
 * `metric`:
 *   'quantity' — vazn bo'yicha (tonna)
 *   'revenue'  — umumiy summa bo'yicha (so'm)
 *
 * Har bir ustun mahsulotning o'z rangida (stats/products.js).
 *
 * `virtual` — "Batafsil" sahifasi uchun: diagramma ostidagi ro'yxat
 * react-window bilan chiziladi va qolgan balandlikni to'ldiradi.
 */
export default function ProductBars({ data, metric, colors, isDark, virtual = false, chartHeight }) {
  const t = useT()
  const key = metric === 'revenue' ? 'revenue' : 'quantity'
  const palette = assignColors(data.map((d) => d.product))

  const colorOf = (product) => {
    const base = palette.get(product)
    return isDark ? forDark(base) : base
  }

  const valueText = (row) =>
    metric === 'revenue' ? formatSum(row.revenue, t) : formatTons(row.quantity, t)

  return (
    <>
      <VerticalBars
        data={data}
        dataKey={key}
        categoryKey="product"
        colors={colors}
        colorOf={(row) => colorOf(row.product)}
        borderOf={(row) => productBorder(row.product)}
        axisFormat={(v) => (metric === 'revenue' ? compactAxis(v, t) : formatNumber(v))}
        /* Ustun tepasida qisqa ko'rinish — to'liq qiymat pastdagi ro'yxatda. */
        labelFormat={(v) => (metric === 'revenue' ? compactAxis(v, t) : formatNumber(Math.round(v)))}
        tooltipTitle={(row) => row.product}
        tooltipRows={(row) => [
          { key: 'v', color: colorOf(row.product), text: valueText(row) },
          { key: 's', color: colors.axis, text: `${t('stats.share')}: ${formatShare(row.share)}` },
          { key: 'c', color: colors.axis, text: t('stats.listings', { count: row.count }) },
        ]}
        height={chartHeight}
      />

      {/* Diagramma ostida aniq raqamlar — o'q yozuvlari qisqargani uchun. */}
      <ValueList
        rows={data}
        virtual={virtual}
        keyOf={(row) => row.product}
        colorOf={(row) => colorOf(row.product)}
        borderOf={(row) => productBorder(row.product)}
        nameOf={(row) => row.product}
        valueOf={valueText}
        extraOf={(row) => formatShare(row.share)}
      />
    </>
  )
}
