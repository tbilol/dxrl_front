import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AnimatedNumber from './AnimatedNumber.jsx'
import { ChevronRightIcon, CoinsIcon, PackageIcon, ScaleIcon, TrendIcon } from './Icons.jsx'
import { useT } from '../i18n/index.jsx'
import { tapSmall } from '../motion.js'

/**
 * Doska tepasidagi statistika paneli.
 *
 * Bu — statistikaga yagona kirish nuqtasi: pastki menyuda statistika tab
 * yo'q, shuning uchun har bir doska (dehqonlar / olib sotuvchilar) o'z
 * qisqacha ko'rsatkichlarini ko'rsatadi va bosilganda tegishli statistika
 * sahifasini ochadi.
 *
 * Panel ataylab YIRIK: bu doskaning birinchi ekrani va raqamlar telefonda
 * ham bir qarashda o'qilishi kerak — har bir ko'rsatkich alohida katakda,
 * ikonkasi va yirik qiymati bilan.
 *
 * Raqamlar ko'rinib turgan e'lonlardan hisoblanadi — qo'shimcha so'rov yo'q.
 */
export default function BoardStats({ items, kind, to }) {
  const t = useT()
  const navigate = useNavigate()

  const list = items ?? []
  const priceKey = kind === 'offer' ? 'price' : 'offer_price'
  const tonnage = list.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
  const priced = list.filter((it) => Number(it[priceKey]) > 0)
  const avgPrice = priced.length
    ? priced.reduce((sum, it) => sum + Number(it[priceKey]), 0) / priced.length
    : 0

  const cells = [
    { key: 'count', icon: PackageIcon, label: t(kind === 'offer' ? 'stats.kpiOffers' : 'stats.kpiRequests'), value: list.length },
    { key: 'tonnage', icon: ScaleIcon, label: t('stats.kpiTonnage'), value: Math.round(tonnage), suffix: t('units.ton') },
    { key: 'price', icon: CoinsIcon, label: t('stats.kpiAvgPrice'), value: Math.round(avgPrice * 1000), suffix: t('units.somPerTonShort') },
  ]

  return (
    <motion.button
      type="button"
      className="board-stats"
      whileTap={tapSmall}
      onClick={() => navigate(to)}
      aria-label={t('stats.open')}
    >
      <span className="bs-head">
        <span className="bs-title">
          <TrendIcon size={16} />
          {t(kind === 'offer' ? 'stats.farmerTitle' : 'stats.resellerTitle')}
        </span>
        <span className="bs-more">
          {t('stats.open')}
          <ChevronRightIcon size={15} />
        </span>
      </span>

      <span className="bs-cells">
        {cells.map((cell) => (
          <span className="bs-cell" key={cell.key}>
            <span className="bs-icon" aria-hidden="true">
              <cell.icon size={15} />
            </span>
            <span className="bs-label">{cell.label}</span>
            <span className="bs-value">
              <AnimatedNumber value={cell.value} decimals={0} />
              {cell.suffix && <span className="bs-unit">{cell.suffix}</span>}
            </span>
          </span>
        ))}
      </span>
    </motion.button>
  )
}
