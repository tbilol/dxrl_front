import { useNavigate } from 'react-router-dom'
import { List } from 'react-window'
import Avatar from '../Avatar.jsx'
import { MapPinIcon, PackageIcon } from '../Icons.jsx'
import { useT } from '../../i18n/index.jsx'
import { forDark, productColor } from '../../stats/products.js'
import { formatSum, formatTons } from '../../stats/format.js'
import { formatNumber } from '../../utils.js'

/**
 * Dehqonlar va xaridorlar reytingi — avatarli "leaderboard".
 *
 * `metric`: 'quantity' (vazn) yoki 'revenue' (summa).
 * `countLabelKey`: qatordagi ikkinchi ko'rsatkich nomi — e'lonlar / so'rovlar /
 *   sotuvlar / xaridlar (bo'limga qarab har xil).
 *
 * Bosh sahifada faqat birinchi o'ntasi ko'rinadi, shuning uchun oddiy
 * `<ol>` yetarli. "Batafsil" sahifasida (`virtual`) ro'yxat 200 qatorgacha
 * cho'ziladi va react-window bilan virtualizatsiya qilinadi: DOM da faqat
 * ekranga sig'adigan qatorlar turadi.
 */

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Qat'iy qator balandligi: qatorning o'zi 74px + orasidagi 8px bo'shliq.
 * Virtualizatsiyada qatorlar absolyut joylashadi, ya'ni `gap` ishlamaydi —
 * bo'shliq shu balandlik ichiga kiradi (index.css dagi `.lb-vrow` padding).
 */
export const LB_ROW = 74
export const LB_GAP = 8
export const LB_ROW_H = LB_ROW + LB_GAP

function Row({ row, index, metric, countLabelKey, isDark, linkProfiles, navigate }) {
  const t = useT()
  const medal = MEDALS[index]
  const accentBase = row.topProduct ? productColor(row.topProduct) : '#8f8f8f'
  const accent = isDark ? forDark(accentBase) : accentBase
  const clickable = linkProfiles && Boolean(row.id)

  const value = metric === 'revenue' ? formatSum(row.revenue, t) : formatTons(row.quantity, t)

  return (
    <>
      {/* Mahsulot rangi faqat halqada — och ranglar (masalan Paxta
          #F5F5DC) raqam sifatida o'qilmaydi, shuning uchun raqamning
          o'zi CSS dagi doimiy (AA dan o'tadigan) rangda qoladi. */}
      <span
        className={`lb-rank${medal ? ' is-medal' : ''}`}
        style={medal ? undefined : { borderColor: accent }}
        aria-label={t('stats.rankPosition', { n: index + 1 })}
      >
        {medal || index + 1}
      </span>

      <Avatar name={row.name} src={row.avatar} size={38} />

      <div className="lb-body">
        <div className="lb-name-row">
          {clickable ? (
            <button
              type="button"
              className="lb-name is-link"
              onClick={() => navigate(`/profile/${row.id}`)}
            >
              {row.name}
            </button>
          ) : (
            <span className="lb-name">{row.name}</span>
          )}
        </div>

        <div className="lb-meta">
          {row.region && (
            <span className="lb-chip">
              <MapPinIcon size={12} />
              {row.region}
            </span>
          )}
          {row.topProduct && (
            /* Mahsulot rangi faqat belgida — och ranglar matn sifatida
               o'qilmaydi (WCAG AA), shuning uchun yozuv odatiy rangda. */
            <span className="lb-chip">
              <span className="lb-swatch" style={{ color: accent }}>
                <PackageIcon size={12} />
              </span>
              {row.topProduct}
            </span>
          )}
        </div>
      </div>

      <div className="lb-figures">
        <span className="lb-value num">{value}</span>
        <span className="lb-count num">
          {t(countLabelKey, { count: formatNumber(row.count) })}
        </span>
      </div>
    </>
  )
}

/** Virtualizatsiyalangan qator — react-window bergan `style` o'ramga qo'llanadi. */
function VirtualRow({ index, style, ariaAttributes, rows, ...rest }) {
  const row = rows[index]
  return (
    <div className="lb-vrow" style={style} {...ariaAttributes}>
      <div className={`lb-row${index < MEDALS.length ? ' is-top' : ''}`}>
        <Row row={row} index={index} {...rest} />
      </div>
    </div>
  )
}

export default function Leaderboard({
  rows,
  metric,
  countLabelKey,
  isDark,
  linkProfiles = false,
  virtual = false,
}) {
  const navigate = useNavigate()
  const rest = { metric, countLabelKey, isDark, linkProfiles, navigate }

  if (virtual) {
    return (
      <List
        className="lb-list is-virtual"
        rowComponent={VirtualRow}
        rowCount={rows.length}
        rowHeight={LB_ROW_H}
        rowProps={{ rows, ...rest }}
        overscanCount={6}
      />
    )
  }

  return (
    <ol className="lb-list">
      {rows.map((row, i) => (
        <li key={row.key} className={`lb-row${i < MEDALS.length ? ' is-top' : ''}`}>
          <Row row={row} index={i} {...rest} />
        </li>
      ))}
    </ol>
  )
}
