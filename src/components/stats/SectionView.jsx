import ProductBars from './ProductBars.jsx'
import Leaderboard from './Leaderboard.jsx'
import PriceTrendChart from './PriceTrendChart.jsx'
import RegionActivity from './RegionActivity.jsx'
import { getSection } from '../../stats/sections.js'

/**
 * Bo'lim turiga (`type`) mos ko'rinishni chizadi.
 *
 * Bosh sahifa ham, "Batafsil" sahifasi ham shu komponentdan foydalanadi —
 * farqi faqat `virtual` va `chartHeight` da, ya'ni bir xil bo'lim ikki joyda
 * bir xil ko'rinadi.
 *
 * `virtual` — uzun ro'yxat react-window bilan chiziladi va ota elementning
 * balandligini to'ldiradi (faqat "Batafsil" sahifasida).
 */
export default function SectionView({
  type,
  rows,
  trend,
  colors,
  isDark,
  usingMock = false,
  virtual = false,
  chartHeight,
}) {
  const section = getSection(type)
  if (!section) return null

  switch (section.view) {
    case 'bars':
      return (
        <ProductBars
          data={rows}
          metric={section.metric}
          colors={colors}
          isDark={isDark}
          virtual={virtual}
          chartHeight={chartHeight}
        />
      )

    case 'board':
      return (
        <Leaderboard
          rows={rows}
          metric={section.metric}
          countLabelKey={section.countLabelKey}
          isDark={isDark}
          linkProfiles={!usingMock}
          virtual={virtual}
        />
      )

    case 'trend':
      return (
        <PriceTrendChart
          trend={trend ?? { products: [], rows: [] }}
          products={rows}
          colors={colors}
          isDark={isDark}
          height={chartHeight}
        />
      )

    case 'regions':
      return (
        <RegionActivity
          data={rows}
          colors={colors}
          isDark={isDark}
          virtual={virtual}
          chartHeight={chartHeight}
        />
      )

    default:
      return null
  }
}
