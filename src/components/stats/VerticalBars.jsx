import { useEffect, useRef, useState } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import ChartTooltip from './ChartTooltip.jsx'
import useMediaQuery from '../../useMediaQuery.js'

/**
 * Vertikal ustunli diagramma — barcha statistika ustunlari uchun yagona asos.
 *
 * · Ustunlar pastdan yuqoriga o'sadi (recharts sukut bo'yicha shunday —
 *   `layout="vertical"` aynan TESKARISINI bildiradi, shuning uchun u yo'q).
 * · X o'qi: nomlar, 45° burilgan — uzun nomlar bir-birining ustiga tushmaydi.
 * · Y o'qi: qiymatlar.
 * · Har bir ustun tepasida qiymat yozuvi.
 * · Ustunlar ko'p bo'lsa konteyner gorizontal siljiydi: har bir ustunga
 *   qat'iy SLOT piksel joy ajratiladi, ustunning o'zi esa hamma joyda bir xil
 *   ingichka qoladi — 200 tasi ham 10 tasi kabi ko'rinadi.
 */

/**
 * Ustun kengligi — qat'iy, bo'sh joyni to'ldirish uchun cho'zilmaydi.
 * Mobilda bir oz torroq: tor ekranda bir vaqtning o'zida ko'proq ustun
 * ko'rinadi.
 */
const BAR_W = 24
const BAR_W_MOBILE = 20

/**
 * Bitta ustunga ajratiladigan joy. Kamida ikki barobar ustun kengligi —
 * demak ustunlar orasidagi bo'shliq ustunning o'zidan kichik bo'lmaydi
 * ("airy"), va 45° burilgan nomlar ham bir-biriga tegmaydi.
 */
const SLOT = BAR_W * 2 + 8
const SLOT_MOBILE = BAR_W_MOBILE * 2 + 6

/** Y o'qi va chetki bo'shliqlar diagramma maydonidan oladigan joy. */
const AXIS_ROOM = 56

export default function VerticalBars({
  data,
  dataKey,
  categoryKey,
  colorOf,
  borderOf,
  colors,
  axisFormat,
  labelFormat,
  tooltipTitle,
  tooltipRows,
  height = 300,
}) {
  const narrow = useMediaQuery('(max-width: 768px)')
  const barSize = narrow ? BAR_W_MOBILE : BAR_W
  const slot = narrow ? SLOT_MOBILE : SLOT

  // Ro'yxat uzun bo'lsa — ichki kenglik oshadi va ota element siljiydi.
  const minWidth = AXIS_ROOM + data.length * slot

  /* O'ng chetdagi "yana bor" belgisi: faqat haqiqatan siljitish mumkin
     bo'lgandagina ko'rinadi, oxiriga yetganda esa o'chadi. */
  const scrollRef = useRef(null)
  const [more, setMore] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined
    const check = () => setMore(el.scrollWidth - el.scrollLeft - el.clientWidth > 8)
    check()
    el.addEventListener('scroll', check, { passive: true })
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(check) : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', check)
      ro?.disconnect()
    }
  }, [minWidth])

  return (
    <div className={`vchart${more ? ' has-more' : ''}`}>
      <div className="vchart-scroll" ref={scrollRef}>
        <div className="vchart-inner" style={{ minWidth }}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 22, right: 6, bottom: 4, left: 0 }}>
              <XAxis
                dataKey={categoryKey}
                tick={{ fill: colors.label, fontSize: 10.5 }}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={72}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: colors.axis, fontSize: 10.5 }}
                tickFormatter={axisFormat}
                axisLine={false}
                tickLine={false}
                width={46}
              />
              <Tooltip
                cursor={{ fill: colors.cursor }}
                content={<ChartTooltip colors={colors} title={tooltipTitle} rows={tooltipRows} />}
              />
              <Bar
                dataKey={dataKey}
                radius={[4, 4, 0, 0]}
                /* Qat'iy kenglik: ustun o'ziga ajratilgan joyning o'rtasida
                   turadi va hech qachon cho'zilmaydi. */
                barSize={barSize}
                /* Ustunlar juda ko'p bo'lsa animatsiya o'chadi: 200 ta ustunni
                   kadrma-kadr o'stirish bitta uzun vazifaga aylanib, "Batafsil"
                   bosilganda sezilarli to'xtash beradi. */
                isAnimationActive={data.length <= 40}
                animationDuration={300}
                animationEasing="ease-out"
              >
                {/*
                  Ustun tepasidagi qiymat.

                  `stroke` ataylab o'chirilgan: recharts `Cell` ning chegara
                  rangini yozuvga ham meros qoldiradi, va 10px li qalin raqam
                  1px lik chiziq ostida butunlay o'sha rangga bo'yalib
                  ketardi (masalan Paxta — #8B7355). Endi raqam faqat
                  `colors.label` rangida.
                */}
                <LabelList
                  dataKey={dataKey}
                  position="top"
                  formatter={labelFormat}
                  fill={colors.label}
                  stroke="none"
                  strokeWidth={0}
                  style={{ fill: colors.label, fontSize: 10, fontWeight: 600 }}
                />
                {data.map((row) => {
                  const border = borderOf?.(row)
                  return (
                    <Cell
                      key={row[categoryKey]}
                      fill={colorOf(row)}
                      stroke={border || undefined}
                      strokeWidth={border ? 1 : 0}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
