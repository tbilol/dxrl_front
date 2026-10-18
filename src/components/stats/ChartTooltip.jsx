/** Diagrammalar uchun yagona ko'rinishdagi maslahat oynasi. */
export default function ChartTooltip({ active, payload, label, colors, title, rows }) {
  if (!active || !payload?.length) return null

  const head = title ? title(payload[0].payload, label) : label
  const lines = rows ? rows(payload[0].payload, payload) : null

  return (
    <div
      className="chart-tip"
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
        color: colors.label,
      }}
    >
      {head && <div className="chart-tip-title">{head}</div>}
      {(lines ?? payload.map((p) => ({ key: p.dataKey, color: p.color, text: `${p.dataKey}: ${p.value}` })))
        .filter(Boolean)
        .map((line) => (
          <div key={line.key} className="chart-tip-row" style={{ color: line.color }}>
            {line.text}
          </div>
        ))}
    </div>
  )
}
