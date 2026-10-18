/** Yuklanish paytidagi skelet holatlar — CLS bo'lmasligi uchun
    haqiqiy kontent bilan bir xil balandlikda. */

/* Fragment qaytaradi — shunda kartalar `.card-grid` ichida to'g'ridan-to'g'ri
   to'r elementlari bo'ladi (o'ralgan div to'rni buzmaydi). */
export function ListingSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="lcard is-skeleton" aria-hidden="true">
          <div className="lcard-hit">
            <div className="lcard-media">
              <div className="skeleton" style={{ aspectRatio: '3 / 2', borderRadius: 0 }} />
            </div>
            <div className="lcard-body">
              <div className="skeleton skeleton-line" style={{ width: '62%', height: 15 }} />
              <div className="skeleton" style={{ width: '78%', height: 18 }} />
              <div className="skeleton skeleton-line" style={{ width: '50%' }} />
              <div className="skeleton skeleton-line" style={{ width: '66%', marginBottom: 0 }} />
            </div>
          </div>
          <div className="lcard-foot">
            <div className="skeleton skeleton-line" style={{ width: 72, marginBottom: 0 }} />
            <div className="skeleton skeleton-line" style={{ width: 34, marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </>
  )
}

export function ConversationSkeleton({ count = 5 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="conv-row is-skeleton">
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-line" style={{ width: '38%' }} />
            <div className="skeleton skeleton-line" style={{ width: '64%', marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BlockSkeleton({ height = 220 }) {
  return <div className="skeleton" style={{ height }} aria-hidden="true" />
}
