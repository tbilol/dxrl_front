/** Yuklanish paytidagi skelet holatlar — CLS bo'lmasligi uchun
    haqiqiy kontent bilan bir xil balandlikda. */

export function ListingSkeleton({ count = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ opacity: 1 - i * 0.18 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 999 }} />
            <div
              className="skeleton"
              style={{ width: 78, height: 32, borderRadius: 10, marginLeft: 'auto' }}
            />
          </div>
          <div className="skeleton skeleton-line" style={{ width: '72%' }} />
          <div className="skeleton skeleton-line" style={{ width: '48%', marginBottom: 0 }} />
        </div>
      ))}
    </div>
  )
}

export function ConversationSkeleton({ count = 5 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 12, padding: '14px 16px', alignItems: 'center' }}
        >
          <div className="skeleton" style={{ width: 50, height: 50, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-line" style={{ width: '42%' }} />
            <div className="skeleton skeleton-line" style={{ width: '68%', marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BlockSkeleton({ height = 220 }) {
  return <div className="skeleton" style={{ height }} aria-hidden="true" />
}
