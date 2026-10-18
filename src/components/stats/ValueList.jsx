import { List } from 'react-window'
import useMediaQuery from '../../useMediaQuery.js'

/**
 * Diagramma ostidagi aniq raqamlar ro'yxati — mahsulotlar va hududlar uchun
 * yagona asos (o'q yozuvlari qisqargani uchun to'liq qiymat shu yerda).
 *
 * `virtual` yoqilganda ro'yxat react-window bilan virtualizatsiya qilinadi:
 * "Batafsil" sahifasida 200 qator bo'lishi mumkin, lekin DOM da faqat
 * ekranga sig'adigani turadi.
 *
 * Qator balandligi qat'iy — virtualizatsiya uchun u oldindan ma'lum bo'lishi
 * kerak. Ikki qiymat bor, chunki tor ekranda ulush (`.pbar-share`) joy tejash
 * uchun ikkinchi satrga tushadi (index.css dagi `@media (min-width: 560px)`
 * bilan bir xil chegara — ikkisi birga o'zgarishi shart).
 */

/** Bir satrli qator (>= 560px). */
export const ROW_H = 35

/** Ikki satrli qator (< 560px — ulush pastga tushadi). */
export const ROW_H_NARROW = 59

function cells(row, i, { rows, keyOf, colorOf, borderOf, nameOf, valueOf, extraOf }) {
  return (
    <>
      <span className="pbar-rank">{i + 1}</span>
      <span
        className="pbar-dot"
        style={{ background: colorOf(row), borderColor: borderOf?.(row) || 'transparent' }}
        aria-hidden="true"
      />
      <span className="pbar-name">{nameOf(row)}</span>
      <span className="pbar-value num">{valueOf(row)}</span>
      <span className="pbar-share num">{extraOf(row)}</span>
    </>
  )
}

/** Virtualizatsiyalangan qator — react-window bergan `style` ni o'zi qo'llaydi. */
function VirtualRow({ index, style, ariaAttributes, ...props }) {
  const row = props.rows[index]
  return (
    <div className="pbar-row" style={style} {...ariaAttributes}>
      {cells(row, index, props)}
    </div>
  )
}

export default function ValueList({
  rows,
  keyOf,
  colorOf,
  borderOf,
  nameOf,
  valueOf,
  extraOf,
  virtual = false,
}) {
  const wide = useMediaQuery('(min-width: 560px)')
  const props = { rows, keyOf, colorOf, borderOf, nameOf, valueOf, extraOf }

  if (virtual) {
    return (
      <List
        className="pbar-list is-virtual"
        rowComponent={VirtualRow}
        rowCount={rows.length}
        rowHeight={wide ? ROW_H : ROW_H_NARROW}
        rowProps={props}
        overscanCount={8}
      />
    )
  }

  return (
    <ol className="pbar-list">
      {rows.map((row, i) => (
        <li key={keyOf(row)} className="pbar-row">
          {cells(row, i, props)}
        </li>
      ))}
    </ol>
  )
}
