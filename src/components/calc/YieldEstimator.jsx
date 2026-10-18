import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HistoryPanel from './HistoryPanel.jsx'
import Keypad from './Keypad.jsx'
import { formatAmount, formatResult } from './format.js'
import useCalcHistory from './history.js'
import { AREA_UNITS, SEED_UNITS, toHectares, toKilograms, unitOf } from './units.js'
import ProductSelect from '../ProductSelect.jsx'
import { ScaleIcon } from '../Icons.jsx'
import { CROPS, findProduct, productLabel } from '../../data/products.js'
import { useLanguage } from '../../i18n/index.jsx'
import { spring, tap } from '../../motion.js'
import { errorMessage, estimateYield } from '../../services/index.js'
import { KEYS } from '../../storage.js'
import log from '../../logger.js'

/**
 * HOSIL BASHORATI — oddiy kalkulyator bilan bir xil ko'rinishda.
 *
 * Yuqorida ekran (tanlangan ekin va kiritmalar + natija), o'rtada ikkita
 * maydon — qaysi biri faol bo'lsa, quyidagi klaviatura aynan o'shanga
 * yozadi. Har bir maydonning o'z birlik tanlagichi bor. "=" tugmasi
 * hisobni ishga tushiradi, natija esa tarixga tushadi.
 *
 * MOCK: hisob services/mock/account.js da — haqiqiy agro-model backendda
 * bo'ladi (tuproq, sug'orish, ob-havo).
 */

const ROWS = [
  [{ k: '7' }, { k: '8' }, { k: '9' }, { k: '⌫', kind: 'clear' }],
  [{ k: '4' }, { k: '5' }, { k: '6' }, { k: 'C', kind: 'clear' }],
  [{ k: '1' }, { k: '2' }, { k: '3' }, { k: '.' }],
  [{ k: '0', wide: true }, { k: '=', kind: 'eq', wide: true }],
]

const EMPTY = { area: '', seed: '' }

export default function YieldEstimator() {
  const { lang, t } = useLanguage()
  const history = useCalcHistory(KEYS.yieldHistory)

  const [crop, setCrop] = useState(CROPS[0].id)
  const [values, setValues] = useState(EMPTY)
  const [areaUnit, setAreaUnit] = useState('ga')
  const [seedUnit, setSeedUnit] = useState('kg')
  const [active, setActive] = useState('area')
  const [error, setError] = useState('')
  const [alert, setAlert] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const cropEntry = findProduct(crop) ?? CROPS[0]
  const areaLabel = t(unitOf(AREA_UNITS, areaUnit).labelKey)
  const seedLabel = t(unitOf(SEED_UNITS, seedUnit).labelKey)

  const calculate = useCallback(async () => {
    setAlert('')

    const area = Number(values.area)
    const seed = Number(values.seed)
    if (!(area > 0)) {
      setError(t('calc.errArea'))
      setActive('area')
      return
    }
    if (!(seed > 0)) {
      setError(t('calc.errSeed'))
      setActive('seed')
      return
    }
    setError('')

    const areaHa = toHectares(area, areaUnit)
    const seedKg = toKilograms(seed, seedUnit)

    setBusy(true)
    try {
      const data = await estimateYield({ crop, areaHa, seedKg })
      setResult(data)
      // Tarixga kiritmalar o'z birligi bilan yoziladi — qayta tiklash uchun.
      history.add({
        crop,
        area: values.area,
        areaUnit,
        seed: values.seed,
        seedUnit,
        tons: data.tons,
      })
      log.front('Hosil bashorati hisoblandi (MOCK)', data)
    } catch (err) {
      setAlert(errorMessage(err, t))
    } finally {
      setBusy(false)
    }
  }, [areaUnit, crop, history, seedUnit, t, values])

  /** Klaviatura faol maydonga yozadi. */
  const press = useCallback(
    (key) => {
      if (key === '=') {
        calculate()
        return
      }

      setResult(null)
      setError('')

      setValues((prev) => {
        const current = prev[active] ?? ''
        let next = current

        if (key === 'C') next = ''
        else if (key === '⌫') next = current.slice(0, -1)
        else if (key === '.') next = current.includes('.') ? current : `${current || '0'}.`
        else if (/^\d$/.test(key)) next = current === '0' ? key : current + key

        return { ...prev, [active]: next }
      })
    },
    [active, calculate],
  )

  /** Tarixdagi yozuv: kiritmalar va natija qaytariladi. */
  const restore = useCallback((entry) => {
    setCrop(entry.crop)
    setValues({ area: String(entry.area ?? ''), seed: String(entry.seed ?? '') })
    setAreaUnit(entry.areaUnit ?? 'ga')
    setSeedUnit(entry.seedUnit ?? 'kg')
    setResult({ tons: entry.tons, minTons: entry.tons * 0.9, maxTons: entry.tons * 1.1 })
    setError('')
  }, [])

  const fields = [
    {
      id: 'area',
      label: t('calc.area'),
      unitLabel: t('calc.areaUnit'),
      units: AREA_UNITS,
      unit: areaUnit,
      setUnit: setAreaUnit,
    },
    {
      id: 'seed',
      label: t('calc.seed'),
      unitLabel: t('calc.seedUnit'),
      units: SEED_UNITS,
      unit: seedUnit,
      setUnit: setSeedUnit,
    },
  ]

  return (
    <div className="calc">
      {alert && <div className="alert">{alert}</div>}

      {/* -------------------------------- Ekran ------------------------------- */}
      <div className="calc-screen">
        <span className="calc-expr">
          {productLabel(cropEntry, lang)}
          {values.area && ` · ${formatAmount(values.area)} ${areaLabel}`}
          {values.seed && ` · ${formatAmount(values.seed)} ${seedLabel}`}
        </span>

        <output className="calc-value num" aria-live="polite" aria-label={t('calc.estimated')}>
          {busy ? <span className="spinner dark" /> : result ? formatResult(result.tons) : '—'}
          <span className="calc-value-unit">{t('units.ton')}</span>
        </output>

        <AnimatePresence initial={false}>
          {result && (
            <motion.span
              className="calc-sub num"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              {formatResult(result.minTons)} – {formatResult(result.maxTons)} {t('units.ton')}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* -------------------------------- Ekin -------------------------------- */}
      <ProductSelect
        label={t('calc.crop')}
        value={crop}
        onChange={(id) => {
          setCrop(id)
          setResult(null)
        }}
        placeholder={t('calc.crop')}
        items={CROPS}
        required={false}
      />

      {/* -------------------- Maydonlar va ularning birliklari ---------------- */}
      <div className="calc-fields">
        {fields.map((field) => (
          <div key={field.id} className={`calc-field${active === field.id ? ' is-active' : ''}`}>
            <button
              type="button"
              className="calc-field-main"
              onClick={() => setActive(field.id)}
              aria-pressed={active === field.id}
            >
              <span className="calc-field-label">{field.label}</span>
              <span className="calc-field-value num">{formatAmount(values[field.id]) || '0'}</span>
            </button>

            <div className="seg seg-xs" role="group" aria-label={field.unitLabel}>
              {field.units.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`seg-btn${field.unit === option.id ? ' active' : ''}`}
                  onClick={() => {
                    field.setUnit(option.id)
                    setResult(null)
                  }}
                  aria-pressed={field.unit === option.id}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="field-msg is-error" role="alert">
          {error}
        </p>
      )}

      {/* ---------------------------- Klaviatura ------------------------------ */}
      <Keypad rows={ROWS} onKey={press} />

      <motion.button
        type="button"
        className="btn btn-primary"
        whileTap={tap}
        onClick={calculate}
        disabled={busy}
      >
        {busy ? <span className="spinner" /> : <ScaleIcon size={17} />}
        {busy ? t('calc.calculating') : t('calc.calculate')}
      </motion.button>

      <p className="calc-result-note">{t('calc.accuracyNote')}</p>
      {result?.expectedSeedKg != null && (
        <p className="calc-result-note">
          {t('calc.seedNorm', { value: formatResult(result.expectedSeedKg) })}
        </p>
      )}

      <HistoryPanel
        items={history.items}
        onPick={restore}
        onClear={history.clear}
        renderRow={(entry) => ({
          title: `${formatAmount(entry.area)} ${t(unitOf(AREA_UNITS, entry.areaUnit).labelKey)} → ${formatResult(entry.tons)} ${t('units.ton')}`,
          sub: `${productLabel(findProduct(entry.crop), lang)} · ${formatAmount(entry.seed)} ${t(unitOf(SEED_UNITS, entry.seedUnit).labelKey)}`,
        })}
      />
    </div>
  )
}
