import { MapPinIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { PERIODS } from '../../stats/analytics.js'
import { REGIONS, regionLabel } from '../../utils.js'

/**
 * Statistika sahifasining global filtrlari — davr va hudud.
 * Ular sahifaning eng tepasida turadi va BARCHA bo'limlarga qo'llanadi.
 *
 * Faol "tabletka" faqat CSS bilan bo'yaladi (framer-motion layoutId emas):
 * shunda filtrni bosish diagrammalar qayta hisoblanayotgan paytda ham
 * bir zumda javob beradi.
 */

const PERIOD_LABELS = {
  today: 'stats.periodToday',
  week: 'stats.periodWeek',
  month: 'stats.periodMonth',
  all: 'stats.periodAll',
}

export default function StatsFilters({
  period,
  onPeriod,
  region,
  district,
  onRegion,
  onDistrict,
  districts,
  lang,
}) {
  const t = useT()

  return (
    <div className="sfilters">
      {/* ------------------------------ Davr ------------------------------ */}
      <div className="sfilter-row" role="group" aria-label={t('stats.period')}>
        {PERIODS.map((key) => (
          <button
            key={key}
            type="button"
            className={`chip${period === key ? ' active' : ''}`}
            aria-pressed={period === key}
            onClick={() => onPeriod(key)}
          >
            {t(PERIOD_LABELS[key])}
          </button>
        ))}
      </div>

      {/* ----------------------------- Hudud ------------------------------ */}
      <div className="sfilter-geo">
        <span className="sfilter-geo-icon" aria-hidden="true">
          <MapPinIcon size={15} />
        </span>

        <label className="sfilter-select">
          <span className="sr-only">{t('stats.region')}</span>
          <select
            value={region ?? ''}
            onChange={(e) => onRegion(e.target.value || null)}
          >
            <option value="">{t('stats.allRegions')}</option>
            {REGIONS.map((r) => (
              <option key={r.uz} value={r.uz}>
                {regionLabel(r, lang)}
              </option>
            ))}
          </select>
        </label>

        <label className="sfilter-select">
          <span className="sr-only">{t('stats.district')}</span>
          <select
            value={district ?? ''}
            disabled={!region || districts.length === 0}
            onChange={(e) => onDistrict(e.target.value || null)}
          >
            <option value="">{t('stats.allDistricts')}</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
