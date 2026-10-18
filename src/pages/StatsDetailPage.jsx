import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import StatsFilters from '../components/stats/StatsFilters.jsx'
import SectionView from '../components/stats/SectionView.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { BlockSkeleton } from '../components/Skeletons.jsx'
import { ArrowLeftIcon, ChartIcon } from '../components/Icons.jsx'
import { useLanguage } from '../i18n/index.jsx'
import { useTheme } from '../theme.jsx'
import { useIsDesktop } from '../useMediaQuery.js'
import { chartPalette } from '../stats/palette.js'
import { getSection, MAX_N, sectionData } from '../stats/sections.js'
import useStatsData from '../stats/useStatsData.js'
import { tapSmall } from '../motion.js'
import useLogMount from '../useLogMount.js'

/**
 * Bitta statistika bo'limining to'liq ekranli sahifasi — "Batafsil".
 *
 * · Bosh sahifa har bir bo'limda faqat top-10 ni ko'rsatadi; to'liq ro'yxat
 *   (MAX_N = 200 tagacha) aynan shu yerda.
 * · Filtrlar (davr + hudud) shu sahifaning O'ZIGA tegishli: bosh sahifadagi
 *   tanlov bilan bog'lanmagan (useStatsData ning alohida nusxasi).
 * · Uzun ro'yxat react-window bilan virtualizatsiya qilinadi (Leaderboard /
 *   ValueList dagi `virtual`): 200 qatordan DOM da faqat ekranga sig'adigani
 *   turadi.
 *
 * Maket — chat oynasi kabi: `position: fixed` qoplama, o'ngdan suriladi va
 * orqaga bosilganda shu yo'nalishda qaytadi (faqat `transform`). Sarlavha,
 * filtrlar va pastdagi sanoq joyida qotib turadi, faqat ro'yxatning o'zi
 * siljiydi — shuning uchun virtualizatsiya uchun aniq balandlik bor.
 */

/** Yopilish animatsiyasi davomiyligi (CSS dagi `sdetail-out` bilan bir xil). */
const CLOSE_MS = 250

/** Diagramma balandligi — mobil / desktop. */
const CHART_H = 300
const CHART_H_DESKTOP = 360

export default function StatsDetailPage() {
  useLogMount('StatsDetailPage')
  const { type } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isDark } = useTheme()
  const isDesktop = useIsDesktop()
  const colors = useMemo(() => chartPalette(isDark), [isDark])

  const stats = useStatsData()
  const { data, loading, usingMock } = stats

  const [closing, setClosing] = useState(false)

  const section = getSection(type)

  const { rows, trend } = useMemo(
    () => (section ? sectionData(type, data, MAX_N) : { rows: [], trend: null }),
    [section, type, data],
  )

  /**
   * Orqaga: avval chiqish animatsiyasi, keyin marshrut o'zgaradi.
   * (Marshrutlar <AnimatePresence> ichida emas — u har bir o'tishni
   * sekinlashtirardi, shuning uchun chiqish shu yerda boshqariladi.)
   */
  const close = useCallback(() => {
    setClosing(true)
    setTimeout(() => navigate('/statistika'), CLOSE_MS)
  }, [navigate])

  // Noto'g'ri manzil — bosh statistika sahifasiga qaytaramiz.
  if (!section) return <Navigate to="/statistika" replace />

  /* Narx dinamikasida reyting ro'yxati yo'q — diagramma bo'sh joyni o'zi
     to'ldiradi (balandlik CSS dan: `.sdetail-view.is-trend`). */
  const chartHeight =
    section.view === 'trend' ? '100%' : isDesktop ? CHART_H_DESKTOP : CHART_H
  const empty = !loading && rows.length === 0

  return (
    <div className={`sdetail${closing ? ' is-closing' : ''}`}>
      {/* -------------------------------- Sarlavha ------------------------------ */}
      <header className="topbar sdetail-top">
        <div className="topbar-row">
          <motion.button
            type="button"
            className="icon-btn"
            whileTap={tapSmall}
            onClick={close}
            aria-label={t('common.back')}
          >
            <ArrowLeftIcon size={17} />
          </motion.button>

          <div className="topbar-titles">
            <h1 className="topbar-title">{t(section.titleKey)}</h1>
            <p className="topbar-sub">{t(section.hintKey)}</p>
          </div>
        </div>
      </header>

      {/* ---------------------- Filtrlar + to'liq ro'yxat ---------------------- */}
      <div className="sdetail-body">
        <div className="sdetail-filters">
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
        </div>

        {stats.alert && <div className="alert sdetail-alert">{stats.alert}</div>}

        {loading ? (
          <div className="sdetail-view">
            <BlockSkeleton height={isDesktop ? CHART_H_DESKTOP : CHART_H} />
          </div>
        ) : empty ? (
          <div className="sdetail-view sdetail-empty">
            <EmptyState
              icon={ChartIcon}
              title={t('stats.emptyFilter')}
              text={t('stats.emptyFilterHint')}
            />
          </div>
        ) : (
          /* Diagramma o'z balandligida qoladi, ro'yxat esa qolgan joyni
             to'ldiradi va faqat o'zi siljiydi (virtualizatsiya shunga
             tayanadi). */
          <div className={`sdetail-view is-${section.view}`}>
            <SectionView
              type={type}
              rows={rows}
              trend={trend}
              colors={colors}
              isDark={isDark}
              usingMock={usingMock}
              virtual
              chartHeight={chartHeight}
            />
          </div>
        )}
      </div>

      {/* ------------------------------ Umumiy sanoq --------------------------- */}
      <footer className="sdetail-foot">
        {loading ? '—' : t('stats.detailTotal', { n: rows.length })}
      </footer>
    </div>
  )
}
