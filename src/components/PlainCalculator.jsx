import { useCallback, useState } from 'react'
import HistoryPanel from './calc/HistoryPanel.jsx'
import Keypad from './calc/Keypad.jsx'
import { EMPTY, pressKey } from './calc/engine.js'
import { formatAmount, formatResult } from './calc/format.js'
import useCalcHistory from './calc/history.js'
import { useT } from '../i18n/index.jsx'
import { KEYS } from '../storage.js'

/**
 * Oddiy arifmetik kalkulyator — kundalik hisob uchun (tarifdan qat'i nazar
 * hammaga ochiq).
 *
 * EKRAN IKKI QATOR:
 *   · tepada — to'liq ifoda, bosilgan amal belgisi bilan ("10 000 + 2 500");
 *   · pastda — joriy kiritma yoki natija, yirik shrift bilan.
 *
 * Hisob mantig'i calc/engine.js da (toza funksiya), bu komponent faqat
 * ko'rinish bilan shug'ullanadi.
 *
 * TARIX: har bir "=" natijasi ifodasi bilan birga saqlanadi (qurilmada,
 * localStorage da). Yozuv bosilsa natija ekranga qaytadi — uni keyingi
 * hisobda davom ettirish mumkin.
 */

const ROWS = [
  [
    { k: 'C', kind: 'clear' },
    { k: '⌫', kind: 'clear' },
    { k: '%', kind: 'op' },
    { k: '÷', kind: 'op' },
  ],
  [{ k: '7' }, { k: '8' }, { k: '9' }, { k: '×', kind: 'op' }],
  [{ k: '4' }, { k: '5' }, { k: '6' }, { k: '−', kind: 'op' }],
  [{ k: '1' }, { k: '2' }, { k: '3' }, { k: '+', kind: 'op' }],
  [{ k: '±', kind: 'op' }, { k: '0' }, { k: '.' }, { k: '=', kind: 'eq' }],
]

export default function PlainCalculator() {
  const t = useT()
  const [state, setState] = useState(EMPTY)
  const history = useCalcHistory(KEYS.calcHistory)

  /*
   * Yangi holat setState UPDATERIDAN TASHQARIDA hisoblanadi: tarixga yozish
   * — nojo'ya ta'sir, updater esa toza bo'lishi kerak (React StrictMode
   * uni ikki marta chaqiradi va yozuv ikkilanib ketardi).
   */
  const press = useCallback(
    (key) => {
      const next = pressKey(state, key)

      // "=" bosilib, haqiqiy natija chiqqan bo'lsa — tarixga yoziladi.
      if (key === '=' && state.op !== null) {
        const value = Number(next.entry)
        if (Number.isFinite(value)) {
          history.add({
            expr: `${formatResult(state.acc ?? 0)} ${state.op} ${formatAmount(state.entry)}`,
            result: formatResult(value),
            value,
          })
        }
      }

      setState(next)
    },
    [history, state],
  )

  /** Tarixdagi natija ekranga qaytadi. */
  const restore = useCallback((entry) => {
    setState({ ...EMPTY, entry: String(entry.value) })
  }, [])

  /* Ekrandagi ifoda: "10 000 + 2 500" — amal bosilgan zahoti ko'rinadi. */
  const expression = [
    state.op !== null ? formatResult(state.acc ?? 0) : '',
    state.op ?? '',
    state.op !== null && !state.fresh ? formatAmount(state.entry) : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Nolga bo'lish kabi holatlarda raqam o'rniga chiziqcha ko'rsatiladi.
  const shown = Number.isFinite(Number(state.entry))
    ? formatAmount(state.entry)
    : formatResult(NaN)

  return (
    <div className="calc">
      <div className="calc-screen">
        <span className="calc-expr" aria-label={t('calc.expression')}>
          {expression || ' '}
        </span>
        <output className="calc-value num" aria-live="polite" aria-label={t('calc.result')}>
          {shown}
        </output>
      </div>

      <Keypad rows={ROWS} onKey={press} />

      <HistoryPanel
        items={history.items}
        onPick={restore}
        onClear={history.clear}
        renderRow={(entry) => ({ title: `${entry.expr} = ${entry.result}`, sub: t('calc.tapToRestore') })}
      />
    </div>
  )
}
